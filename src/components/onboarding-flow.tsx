import * as React from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { DICTIONARY } from "@/src/lib/i18n"
import { formatCurrency } from "@/src/lib/utils"

interface OnboardingFlowProps {
  user: any
  onComplete: (data: any) => void
}

export function OnboardingFlow({ user, onComplete }: OnboardingFlowProps) {
  const [cash, setCash] = React.useState("0")
  const [invested, setInvested] = React.useState("0")
  const t = DICTIONARY[user?.language as keyof typeof DICTIONARY || 'en']

  const handleCashKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') setCash(prev => prev + e.key)
    else if (e.key === 'Backspace') setCash(prev => prev.slice(0, -1))
  }

  const handleInvestedKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') setInvested(prev => prev + e.key)
    else if (e.key === 'Backspace') setInvested(prev => prev.slice(0, -1))
  }

  const cashCents = parseInt(cash || "0", 10)
  const investedCents = parseInt(invested || "0", 10)

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{t.onboardingTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.cashBalance}</label>
            <div className="relative">
              <Input 
                className="text-2xl h-12 font-mono tabular-nums text-center" 
                value={formatCurrency(cashCents, user?.currency, user?.language === 'pt' ? 'pt-BR' : 'en-US')}
                onKeyDown={handleCashKeyDown}
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.investedBalance}</label>
            <div className="relative">
              <Input 
                className="text-2xl h-12 font-mono tabular-nums text-center" 
                value={formatCurrency(investedCents, user?.currency, user?.language === 'pt' ? 'pt-BR' : 'en-US')}
                onKeyDown={handleInvestedKeyDown}
                readOnly
              />
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg" 
            onClick={() => onComplete({ cashBalanceCents: cashCents, investedBalanceCents: investedCents })}
          >
            {t.finish}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
