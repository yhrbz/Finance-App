import * as React from "react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { DICTIONARY } from "@/src/lib/i18n"
import { formatCurrency } from "@/src/lib/utils"

interface ReportDashboardProps {
  user: any
  summary: any[]
}

export function ReportDashboard({ user, summary }: ReportDashboardProps) {
  const t = DICTIONARY[user?.language as keyof typeof DICTIONARY || 'en']
  const locale = user?.language === 'pt' ? 'pt-BR' : 'en-US'

  const chartData = React.useMemo(() => {
    return [...summary].reverse().map(item => ({
      name: item.monthKey,
      income: item.totalIncome / 100,
      expense: item.totalExpense / 100,
      investment: item.totalInvestment / 100,
    }))
  }, [summary])

  const latest = summary[0] || { totalIncome: 0, totalExpense: 0, totalInvestment: 0 }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t.report}</h2>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.income}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(latest.totalIncome, user?.currency, locale)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.expense}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(latest.totalExpense, user?.currency, locale)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.investment}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(latest.totalInvestment, user?.currency, locale)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>{t.monthlySummary}</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: user?.currency }).format(value)}
                />
                <Legend />
                <Bar dataKey="income" fill="#16a34a" name={t.income} />
                <Bar dataKey="expense" fill="#dc2626" name={t.expense} />
                <Bar dataKey="investment" fill="#2563eb" name={t.investment} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>{t.performance}</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: user?.currency }).format(value)}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#16a34a" name={t.income} strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#dc2626" name={t.expense} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
