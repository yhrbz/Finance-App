import * as React from "react"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  isBefore,
  parseISO
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { DICTIONARY } from "@/src/lib/i18n"
import { formatCurrency, getValueFill, cn } from "@/src/lib/utils"
import { EditEntryDialog } from "./edit-entry-dialog"

interface EntriesTableProps {
  user: any
  onboarding: any
  entries: any[]
  currentMonth: Date
  onMonthChange: (date: Date) => void
  onSaveEntry: (date: string, type: string, value: number) => void
}

export function EntriesTable({ user, onboarding, entries, currentMonth, onMonthChange, onSaveEntry }: EntriesTableProps) {
  const t = DICTIONARY[user?.language as keyof typeof DICTIONARY || 'en']
  const [editingCell, setEditingCell] = React.useState<any>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const onboardingDate = onboarding?.completedAt ? parseISO(onboarding.completedAt) : new Date()
  const onboardingMonthStart = startOfMonth(onboardingDate)

  // Calculate running balance
  // Total(day) = Total(previous day) + Income - (Expense + Investment)
  // Initial balance from onboarding
  const initialBalance = (onboarding?.cashBalanceCents || 0) + (onboarding?.investedBalanceCents || 0)

  const rows = React.useMemo(() => {
    let runningTotal = initialBalance
    
    // If we are in a month AFTER onboarding, we need to calculate the balance from previous months
    // For MVP simplicity, we assume we only have data from onboarding onwards
    // and we'd ideally fetch the previous month's closing balance.
    // Here we'll just calculate it based on the entries we have.
    
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const entry = entries.find(e => e.date === dateStr) || { incomeCents: 0, expenseCents: 0, investmentCents: 0 }
      
      runningTotal += (entry.incomeCents || 0) - ((entry.expenseCents || 0) + (entry.investmentCents || 0))
      
      return {
        date: dateStr,
        day: format(day, 'dd'),
        income: entry.incomeCents || 0,
        expense: entry.expenseCents || 0,
        investment: entry.investmentCents || 0,
        total: runningTotal
      }
    })
  }, [days, entries, initialBalance])

  const canGoBack = !isBefore(addMonths(monthStart, -1), onboardingMonthStart)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onMonthChange(addMonths(currentMonth, -1))}
            disabled={!canGoBack}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">{t.date}</TableHead>
              <TableHead className="text-right">{t.income}</TableHead>
              <TableHead className="text-right">{t.expense}</TableHead>
              <TableHead className="text-right">{t.investment}</TableHead>
              <TableHead className="text-right">{t.total}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const fill = getValueFill(row.total)
              return (
                <TableRow key={row.date}>
                  <TableCell className="font-medium">{row.day}</TableCell>
                  <TableCell 
                    className="text-right cursor-pointer hover:bg-accent tabular-nums"
                    onClick={() => setEditingCell({ date: row.date, type: 'income', valueCents: row.income })}
                  >
                    {formatCurrency(row.income, user?.currency, user?.language === 'pt' ? 'pt-BR' : 'en-US')}
                  </TableCell>
                  <TableCell 
                    className="text-right cursor-pointer hover:bg-accent tabular-nums"
                    onClick={() => setEditingCell({ date: row.date, type: 'expense', valueCents: row.expense })}
                  >
                    {formatCurrency(row.expense, user?.currency, user?.language === 'pt' ? 'pt-BR' : 'en-US')}
                  </TableCell>
                  <TableCell 
                    className="text-right cursor-pointer hover:bg-accent tabular-nums"
                    onClick={() => setEditingCell({ date: row.date, type: 'investment', valueCents: row.investment })}
                  >
                    {formatCurrency(row.investment, user?.currency, user?.language === 'pt' ? 'pt-BR' : 'en-US')}
                  </TableCell>
                  <TableCell 
                    className={cn("text-right font-bold tabular-nums", fill.textClassName)}
                    style={{ backgroundColor: fill.backgroundColor }}
                    aria-label={fill.a11yLabel}
                  >
                    {formatCurrency(row.total, user?.currency, user?.language === 'pt' ? 'pt-BR' : 'en-US')}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <EditEntryDialog
        isOpen={!!editingCell}
        onClose={() => setEditingCell(null)}
        user={user}
        entry={editingCell}
        onSave={(value) => {
          onSaveEntry(editingCell.date, editingCell.type, value)
          setEditingCell(null)
        }}
      />
    </div>
  )
}
