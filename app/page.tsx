"use client";

import { trpc } from "@/lib/trpc.client";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Plus,
  ArrowUpRight,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCurrencyStore } from "@/stores/currency.store";
import { formatCurrency } from "@/lib/currency";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
    
    // Money gathered from debts (borrowed)
    const totalBorrowed = debts?.filter(d => d.type === "debt").reduce((acc, d) => acc + Number(d.amount), 0) || 0;
    // Money lent out (credit)
    const totalLent = debts?.filter(d => d.type === "credit").reduce((acc, d) => acc + Number(d.amount), 0) || 0;

    const moneyIn = totalIncome + totalBorrowed;
    const moneyOut = totalExpense + totalLent;

    const currentSavings = savings?.reduce((acc, s) => acc + Number(s.currentAmount), 0) || 0;
    const activeDebts = debts?.filter(d => d.type === "debt" && d.status !== "paid").reduce((acc, d) => acc + (Number(d.amount) - Number(d.paidAmount)), 0) || 0;
    
    return { 
      totalIn: moneyIn,
      incomeAlone: totalIncome,
      debtReceived: totalBorrowed,
      totalOut: moneyOut, 
      expenseAlone: totalExpense,
      moneyCreditted: totalLent,
      balance: moneyIn - moneyOut, 
      currentSavings, 
      activeDebts 
    };
  }, [transactions, savings, debts]);

  const recentTransactions = transactions?.slice(0, 8) || [];

  const {
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

    // Total Flow Chart Data (Income+Debt vs Expense+Credit)
    const txByDate: Record<string, { income: number; expense: number }> = {};
    txs.forEach(t => {
      const dateStr = format(new Date(t.date), "MMM dd");
      if (!txByDate[dateStr]) txByDate[dateStr] = { income: 0, expense: 0 };
      if (t.type === "income") txByDate[dateStr].income += Number(t.amount);
      if (t.type === "expense") txByDate[dateStr].expense += Number(t.amount);
    });
    dbs.forEach(d => {
      if (!d.createdAt) return;
      const dateStr = format(new Date(d.createdAt), "MMM dd");
      if (!txByDate[dateStr]) txByDate[dateStr] = { income: 0, expense: 0 };
      if (d.type === "debt") txByDate[dateStr].income += Number(d.amount); // Money In
      if (d.type === "credit") txByDate[dateStr].expense += Number(d.amount); // Money Out
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
    income: { label: "Money In", color: "#10b981" },
    expense: { label: "Money Out", color: "#ef4444" },
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

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Money In Section */}
        <div className="space-y-4">
          <Card className="border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Money In</span>
                    <Tooltip>
                      <TooltipTrigger
                      render={<Info className="w-3.5 h-3.5 text-emerald-500/50 cursor-help" />}
                    />
                      <TooltipContent>Total funds received from all sources (Income + Debts)</TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Inflow</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{formatCurrency(stats.totalIn, currency)}
              </p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4">
             <Card className="border-emerald-500/10 bg-background/50">
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Income Alone</p>
                  <p className="text-lg font-bold text-emerald-600">+{formatCurrency(stats.incomeAlone, currency)}</p>
                </CardContent>
             </Card>
             <Card className="border-emerald-500/10 bg-background/50">
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Debt Received</p>
                  <p className="text-lg font-bold text-emerald-600">+{formatCurrency(stats.debtReceived, currency)}</p>
                </CardContent>
             </Card>
          </div>
        </div>

        {/* Money Out Section */}
        <div className="space-y-4">
          <Card className="border-red-500/20 bg-red-50/30 dark:bg-red-950/20 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-red-700 dark:text-red-400">Money Out</span>
                    <Tooltip>
                      <TooltipTrigger
                      render={<Info className="w-3.5 h-3.5 text-red-500/50 cursor-help" />}
                    />
                      <TooltipContent>Total money spent or lent out (Expenses + Credits)</TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Outflow</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                -{formatCurrency(stats.totalOut, currency)}
              </p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4">
             <Card className="border-red-500/10 bg-background/50">
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Expenses Alone</p>
                  <p className="text-lg font-bold text-red-600">-{formatCurrency(stats.expenseAlone, currency)}</p>
                </CardContent>
             </Card>
             <Card className="border-red-500/10 bg-background/50">
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Money Creditted</p>
                  <p className="text-lg font-bold text-red-600">-{formatCurrency(stats.moneyCreditted, currency)}</p>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
         <Card className="bg-muted/30 border-none shadow-none">
            <CardContent className="py-4 flex items-center justify-between">
               <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Wallet Balance</p>
                  <p className={cn("text-xl font-bold tabular-nums", stats.balance >= 0 ? "text-primary" : "text-red-600")}>
                    {stats.balance >= 0 ? "+" : "-"}{formatCurrency(Math.abs(stats.balance), currency)}
                  </p>
               </div>
               <Wallet className="w-6 h-6 text-muted-foreground/30" />
            </CardContent>
         </Card>
         <Card className="bg-muted/30 border-none shadow-none">
            <CardContent className="py-4 flex items-center justify-between">
               <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Current Savings</p>
                  <p className="text-xl font-bold text-blue-600 tabular-nums">{formatCurrency(stats.currentSavings, currency)}</p>
               </div>
               <PiggyBank className="w-6 h-6 text-muted-foreground/30" />
            </CardContent>
         </Card>
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
                <CardTitle className="text-base">Money In vs Money Out</CardTitle>
                <CardDescription>Area chart showing your total cash flow (including loans)</CardDescription>
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


