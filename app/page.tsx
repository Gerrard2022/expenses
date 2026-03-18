"use client";

import { trpc } from "@/lib/trpc.client";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCurrencyStore } from "@/stores/currency.store";
import { formatCurrency } from "@/lib/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { subWeeks, subMonths, subYears, isAfter, format, startOfWeek, startOfMonth } from "date-fns";

type TimeRange = "1w" | "1m" | "3m" | "6m" | "1y" | "all";

export default function DashboardPage() {
  const { data: user } = trpc.user.me.useQuery();
  const { data: transactions } = trpc.transaction.getAll.useQuery();
  const { data: savings } = trpc.saving.getAll.useQuery();
  const { data: debts } = trpc.debtCredit.getAll.useQuery();
  const { data: categories } = trpc.category.getAll.useQuery();
  const currency = useCurrencyStore((s) => s.currency);

  const [timeRange, setTimeRange] = useState<TimeRange>("1m");

  const stats = useMemo(() => {
    const totalIncome = transactions?.filter(t => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0) || 0;
    const totalExpense = transactions?.filter(t => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0) || 0;
    const currentSavings = savings?.reduce((acc, s) => acc + Number(s.currentAmount), 0) || 0;
    const activeDebts = debts?.filter(d => d.type === "debt" && d.status !== "paid").reduce((acc, d) => acc + (Number(d.amount) - Number(d.paidAmount)), 0) || 0;
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense, currentSavings, activeDebts };
  }, [transactions, savings, debts]);

  const recentTransactions = transactions?.slice(0, 8) || [];

  const {
    filteredTransactions,
    filteredDebts,
    chartDataIncomeExpense,
    chartDataDebtCredit,
    chartDataCategories,
    chartDataDebtDistribution
  } = useMemo(() => {
    if (!transactions && !debts) {
      return {
        filteredTransactions: [], filteredDebts: [],
        chartDataIncomeExpense: [], chartDataDebtCredit: [],
        chartDataCategories: [], chartDataDebtDistribution: []
      };
    }

    const now = new Date();
    let startDate: Date | null = null;
    switch (timeRange) {
      case "1w": startDate = subWeeks(now, 1); break;
      case "1m": startDate = subMonths(now, 1); break;
      case "3m": startDate = subMonths(now, 3); break;
      case "6m": startDate = subMonths(now, 6); break;
      case "1y": startDate = subYears(now, 1); break;
      case "all": startDate = null; break;
    }

    const txs = (transactions || []).filter(t => startDate ? isAfter(new Date(t.date), startDate) : true);
    const dbs = (debts || []).filter(d => startDate ? d.createdAt && isAfter(new Date(d.createdAt), startDate) : true);

    // Income Expense Area Chart Data
    const txByDate: Record<string, { income: number; expense: number }> = {};
    txs.forEach(t => {
      const dateStr = format(new Date(t.date), "MMM dd");
      if (!txByDate[dateStr]) txByDate[dateStr] = { income: 0, expense: 0 };
      if (t.type === "income") txByDate[dateStr].income += Number(t.amount);
      if (t.type === "expense") txByDate[dateStr].expense += Number(t.amount);
    });
    const iterDate = startDate ? new Date(startDate) : (txs.length ? new Date(txs[txs.length - 1].date) : new Date());
    while (iterDate <= now) {
      const dateStr = format(iterDate, "MMM dd");
      if (!txByDate[dateStr]) txByDate[dateStr] = { income: 0, expense: 0 };
      iterDate.setDate(iterDate.getDate() + 1);
    }
    const chartDataIncomeExpense = Object.keys(txByDate).map(date => ({
      date,
      income: txByDate[date].income,
      expense: txByDate[date].expense,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Category Bar Chart Data
    const expByCategory: Record<string, number> = {};
    txs.filter(t => t.type === "expense").forEach(t => {
      const catName = categories?.find(c => c.id === t.categoryId)?.name || "Uncategorized";
      expByCategory[catName] = (expByCategory[catName] || 0) + Number(t.amount);
    });
    const chartDataCategories = Object.keys(expByCategory).map(name => ({
      name,
      amount: expByCategory[name]
    })).sort((a, b) => b.amount - a.amount).slice(0, 10);

    // Debt & Credit Area Chart Data
    const dbsByDate: Record<string, { debt: number; credit: number }> = {};
    dbs.forEach(d => {
      if (!d.createdAt) return;
      const dateStr = format(new Date(d.createdAt), "MMM dd");
      if (!dbsByDate[dateStr]) dbsByDate[dateStr] = { debt: 0, credit: 0 };
      if (d.type === "debt") dbsByDate[dateStr].debt += Number(d.amount);
      if (d.type === "credit") dbsByDate[dateStr].credit += Number(d.amount);
    });
    const iterDateDb = startDate ? new Date(startDate) : (dbs.length && dbs[dbs.length - 1]?.createdAt ? new Date(dbs[dbs.length - 1].createdAt as string) : new Date());
    while (iterDateDb <= now) {
      const dateStr = format(iterDateDb, "MMM dd");
      if (!dbsByDate[dateStr]) dbsByDate[dateStr] = { debt: 0, credit: 0 };
      iterDateDb.setDate(iterDateDb.getDate() + 1);
    }
    const chartDataDebtCredit = Object.keys(dbsByDate).map(date => ({
      date,
      debt: dbsByDate[date].debt,
      credit: dbsByDate[date].credit,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Debt Distribution Data
    const dbsDistribution: Record<string, { debt: number; credit: number }> = {};
    dbs.forEach(d => {
      const distName = d.personName || "Unknown";
      if (!dbsDistribution[distName]) dbsDistribution[distName] = { debt: 0, credit: 0 };
      if (d.type === "debt") dbsDistribution[distName].debt += Number(d.amount);
      if (d.type === "credit") dbsDistribution[distName].credit += Number(d.amount);
    });
    const chartDataDebtDistribution = Object.keys(dbsDistribution).map(name => ({
      name,
      debt: dbsDistribution[name].debt,
      credit: dbsDistribution[name].credit
    })).sort((a, b) => (b.debt + b.credit) - (a.debt + a.credit)).slice(0, 10);

    return {
      filteredTransactions: txs,
      filteredDebts: dbs,
      chartDataIncomeExpense,
      chartDataCategories,
      chartDataDebtCredit,
      chartDataDebtDistribution
    }

  }, [transactions, debts, categories, timeRange]);

  const hasData = (transactions && transactions.length > 0) || (debts && debts.length > 0);

  const incomeExpenseConfig: ChartConfig = {
    income: { label: "Income", color: "#10b981" },
    expense: { label: "Expense", color: "#ef4444" },
  };

  const categoryConfig: ChartConfig = {
    amount: { label: "Amount Spent", color: "#ef4444" },
  };

  const debtCreditConfig: ChartConfig = {
    debt: { label: "Debt", color: "#ef4444" },
    credit: { label: "Credit", color: "#3b82f6" },
  };

  const debtDistConfig: ChartConfig = {
    debt: { label: "Debt", color: "#ef4444" },
    credit: { label: "Credit", color: "#3b82f6" },
  };

  return (
    <div className="space-y-8 py-6 max-w-[1200px] mx-auto w-full px-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">
            {user?.name ? `Good day, ${user.name}` : "Dashboard"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Here's an overview of your finances.</p>
        </div>
        <Link
          href="/transactions"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New transaction
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Balance" value={stats.balance} currency={currency} icon={Wallet} />
        <StatCard label="Income" value={stats.totalIncome} currency={currency} icon={TrendingUp} />
        <StatCard label="Expenses" value={stats.totalExpense} currency={currency} icon={TrendingDown} />
        <StatCard label="Savings" value={stats.currentSavings} currency={currency} icon={PiggyBank} />
      </div>

      {/* No Data State */}
      {!hasData ? (
        <Card className="flex items-center justify-center p-12 mt-8">
          <CardContent className="text-center pb-0 space-y-4">
            <h3 className="text-lg font-medium text-muted-foreground">I can't show u ur charts if you don't use the bloody app.</h3>
            <p className="text-sm text-muted-foreground/80">Add your first transaction to see the magic happen.</p>
            <Link
              href="/transactions"
              className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Start Recording
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl">
            <h2 className="text-lg font-semibold">Analytics View</h2>
            <Select value={timeRange} onValueChange={(val) => { if (val) setTimeRange(val as TimeRange); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1w">Last 1 Week</SelectItem>
                <SelectItem value="1m">Last 1 Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last 1 Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* Income vs Expense Area Chart */}
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle className="text-base">Income vs Expenses</CardTitle>
                <CardDescription>Area chart showing your cash flow</CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <ChartContainer config={incomeExpenseConfig} className="h-[300px] w-full">
                  <AreaChart data={chartDataIncomeExpense} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => `${value}`}
                      width={60}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="var(--color-income)"
                      fillOpacity={1}
                      fill="url(#fillIncome)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="var(--color-expense)"
                      fillOpacity={1}
                      fill="url(#fillExpense)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Top Categories Bar Chart */}
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle className="text-base">Top Categories (Expenses)</CardTitle>
                <CardDescription>Bar chart of where you've spent the most</CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <ChartContainer config={categoryConfig} className="h-[300px] w-full">
                  <BarChart data={chartDataCategories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(val) => val.length > 8 ? val.substring(0, 8) + '...' : val}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} width={60} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Debts vs Credits Area Chart */}
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle className="text-base">Debts vs Credits Over Time</CardTitle>
                <CardDescription>Area chart tracking your debts and credits</CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <ChartContainer config={debtCreditConfig} className="h-[300px] w-full">
                  <AreaChart data={chartDataDebtCredit} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillDebt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-debt)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-debt)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fillCredit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-credit)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-credit)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} width={60} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="step" dataKey="debt" stroke="var(--color-debt)" fillOpacity={1} fill="url(#fillDebt)" />
                    <Area type="step" dataKey="credit" stroke="var(--color-credit)" fillOpacity={1} fill="url(#fillCredit)" />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Debt/Credit Distribution By Name */}
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle className="text-base">Debt & Credit Distribution</CardTitle>
                <CardDescription>Bar chart showing breakdown by associate</CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <ChartContainer config={debtDistConfig} className="h-[300px] w-full">
                  <BarChart data={chartDataDebtDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8} 
                      tickFormatter={(val) => val.length > 8 ? val.substring(0, 8) + '...' : val}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} width={60} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="debt" fill="var(--color-debt)" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="credit" fill="var(--color-credit)" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Recents area could go below or alongside charts based on space, keeping it visible for UX */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
              <Link href="/transactions" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentTransactions.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between px-6 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                          {tx.type === "income" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{tx.name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium tabular-nums ${tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <p className="text-sm text-muted-foreground">No recent transactions for this filter.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Debt alert */}
          {stats.activeDebts > 0 && (
            <Card className="border-destructive/20 h-fit">
              <CardContent className="flex items-center justify-between py-4 px-6">
                <div>
                  <p className="text-sm font-medium">Outstanding debt</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatCurrency(stats.activeDebts, currency)} pending
                  </p>
                </div>
                <Link
                  href="/debt-credit"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Review
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, currency, icon: Icon }: { label: string; value: number; currency: string; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold tabular-nums">
          {formatCurrency(Math.abs(value), currency as any)}
        </p>
      </CardContent>
    </Card>
  );
}
