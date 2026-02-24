/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react"
import { AppHeader } from "./components/app-header"
import { SettingsModal } from "./components/settings-modal"
import { EntriesTable } from "./components/entries-table"
import { ReportDashboard } from "./components/report-dashboard"
import { OnboardingFlow } from "./components/onboarding-flow"
import { LandingPage } from "./components/landing-page"
import { format } from "date-fns"

export default function App() {
  const [user, setUser] = React.useState<any>(null)
  const [onboarding, setOnboarding] = React.useState<any>(null)
  const [entries, setEntries] = React.useState<any[]>([])
  const [reportSummary, setReportSummary] = React.useState<any[]>([])
  const [activeRoute, setActiveRoute] = React.useState('entries')
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [loading, setLoading] = React.useState(true)

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        setUser(null)
      }
    } catch (e) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchEntries = async (month: Date) => {
    if (!user) return
    const monthKey = format(month, 'yyyy-MM')
    const res = await fetch(`/api/entries?monthKey=${monthKey}`)
    if (res.ok) {
      const data = await res.json()
      setEntries(data.entries)
      setOnboarding(data.onboarding)
    }
  }

  const fetchReport = async () => {
    if (!user) return
    const res = await fetch('/api/reports/summary')
    if (res.ok) {
      const data = await res.json()
      setReportSummary(data)
    }
  }

  React.useEffect(() => {
    fetchUser()
  }, [])

  React.useEffect(() => {
    if (user && user.onboardingCompleted) {
      fetchEntries(currentMonth)
      fetchReport()
    }
  }, [user, currentMonth])

  const handleSignIn = async () => {
    const res = await fetch('/api/auth/url')
    const { url } = await res.json()
    const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700')
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchUser()
        window.removeEventListener('message', handleMessage)
      }
    }
    window.addEventListener('message', handleMessage)
  }

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setActiveRoute('entries')
  }

  const handleSaveSettings = async (settings: any) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    if (res.ok) {
      fetchUser()
    }
  }

  const handleCompleteOnboarding = async (data: any) => {
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (res.ok) {
      fetchUser()
    }
  }

  const handleSaveEntry = async (date: string, type: string, value: number) => {
    const existing = entries.find(e => e.date === date) || {
      incomeCents: 0,
      expenseCents: 0,
      investmentCents: 0
    }

    const payload = {
      date,
      monthKey: format(parseISO(date), 'yyyy-MM'),
      incomeCents: type === 'income' ? value : existing.incomeCents,
      expenseCents: type === 'expense' ? value : existing.expenseCents,
      investmentCents: type === 'investment' ? value : existing.investmentCents,
    }

    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      fetchEntries(currentMonth)
      fetchReport()
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return <LandingPage onSignIn={handleSignIn} />
  }

  if (!user.onboardingCompleted) {
    return <OnboardingFlow user={user} onComplete={handleCompleteOnboarding} />
  }

  return (
    <div className={user.theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader 
          user={user} 
          activeRoute={activeRoute} 
          onNavigate={setActiveRoute} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSignOut={handleSignOut}
        />
        
        <main className="container mx-auto px-4 py-8">
          {activeRoute === 'entries' ? (
            <EntriesTable 
              user={user}
              onboarding={onboarding}
              entries={entries}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              onSaveEntry={handleSaveEntry}
            />
          ) : (
            <ReportDashboard user={user} summary={reportSummary} />
          )}
        </main>

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          user={user}
          onSave={handleSaveSettings}
        />
      </div>
    </div>
  )
}

// Helper to parse ISO date string
function parseISO(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
