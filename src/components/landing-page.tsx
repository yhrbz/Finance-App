import * as React from "react"
import { Button } from "./ui/button"
import { Wallet, TrendingUp, ShieldCheck } from "lucide-react"

interface LandingPageProps {
  onSignIn: () => void
}

export function LandingPage({ onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold">FinTrack</div>
        <Button onClick={onSignIn}>Sign In with Google</Button>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Master your finances <br />
            <span className="text-primary">with spreadsheet precision.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A minimal, powerful personal finance tracker designed for those who love the control of a spreadsheet but want the convenience of a modern app.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={onSignIn} className="h-14 px-8 text-lg">
              Get Started for Free
            </Button>
          </div>
        </section>

        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-12">
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Wallet className="text-primary" />
              </div>
              <h3 className="text-xl font-bold">Simple Entries</h3>
              <p className="text-muted-foreground">Quickly log income, expenses, and investments with a banking-style keypad.</p>
            </div>
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="text-primary" />
              </div>
              <h3 className="text-xl font-bold">Running Balance</h3>
              <p className="text-muted-foreground">See your daily net worth evolution with automatic running balance calculations.</p>
            </div>
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <ShieldCheck className="text-primary" />
              </div>
              <h3 className="text-xl font-bold">Secure & Private</h3>
              <p className="text-muted-foreground">Your data is yours. Securely authenticated via Google with full privacy control.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-12 border-t text-center text-muted-foreground">
        <p>© 2026 FinTrack. Built for financial clarity.</p>
      </footer>
    </div>
  )
}
