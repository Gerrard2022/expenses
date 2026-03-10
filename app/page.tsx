"use client";

import { trpc } from "@/lib/trpc.client";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  Plus,
  Calendar,
  Clock,
  Receipt
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function DashboardPage() {
  const { data: user } = trpc.user.me.useQuery();
  const { data: transactions } = trpc.transaction.getAll.useQuery();
  const { data: savings } = trpc.saving.getAll.useQuery();
  const { data: debts } = trpc.debtCredit.getAll.useQuery();

  const stats = useMemo(() => {
    const totalIncome = transactions?.filter(t => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0) || 0;
    const totalExpense = transactions?.filter(t => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0) || 0;
    const currentSavings = savings?.reduce((acc, s) => acc + Number(s.currentAmount), 0) || 0;
    const activeDebts = debts?.filter(d => d.type === "debt" && d.status !== "paid").reduce((acc, d) => acc + (Number(d.amount) - Number(d.paidAmount)), 0) || 0;

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      currentSavings,
      activeDebts,
      currency: user?.currency || "USD"
    };
  }, [transactions, savings, debts, user]);

  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Welcome back, <span className="text-green-500">{user?.name || "Member"}</span>
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-500/60" />
            Everything's looking good today.
          </p>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95 group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Add Transaction
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Balance"
          value={stats.balance}
          icon={Wallet}
          color="green"
          currency={stats.currency}
        />
        <StatCard
          label="Total Income"
          value={stats.totalIncome}
          icon={TrendingUp}
          color="green"
          currency={stats.currency}
        />
        <StatCard
          label="Total Expenses"
          value={stats.totalExpense}
          icon={TrendingDown}
          color="red"
          currency={stats.currency}
        />
        <StatCard
          label="Savings Progress"
          value={stats.currentSavings}
          icon={PiggyBank}
          color="blue"
          currency={stats.currency}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-4 bg-card border border-border rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Receipt className="w-32 h-32 text-green-500" />
          </div>

          <div className="flex items-center justify-between relative">
            <h2 className="text-2xl font-bold text-foreground">Recent Transactions</h2>
            <Link href="/transactions" className="text-green-500 hover:underline text-sm font-semibold flex items-center gap-1 group/link">
              View All
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
            </Link>
          </div>

          <div className="space-y-4 relative">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-5 bg-background border border-border/50 rounded-3xl hover:border-green-500/30 transition-all hover:bg-green-500/[0.02] group/item">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover/item:scale-110 ${tx.type === "income" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      }`}>
                      {tx.type === "income" ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-bold text-foreground group-hover/item:text-green-500 transition-colors">{tx.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-extrabold ${tx.type === "income" ? "text-green-500" : "text-red-500"
                      }`}>
                      {tx.type === "income" ? "+" : "-"}{stats.currency} {Number(tx.amount).toLocaleString()}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{tx.type}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl opacity-50">
                <p className="text-muted-foreground">No recent transactions to show.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Summary/Debts */}
        <div className="lg:col-span-2 bg-black dark:bg-green-500 text-white dark:text-black rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />

          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-widest opacity-60">Impact Status</p>
            <h3 className="text-6xl font-black mt-4 leading-none tracking-tighter">
              {stats.activeDebts > 0 ? "PAY" : "SAFE"}
            </h3>
            <p className="mt-4 text-sm font-medium opacity-80 leading-relaxed">
              {stats.activeDebts > 0
                ? `You have ${stats.currency} ${stats.activeDebts.toLocaleString()} in pending debts. Plan your payments wisely.`
                : "You're debt-free! Your financial health looks amazing. Keep it up."}
            </p>
          </div>

          <div className="mt-12 space-y-4 relative">
            <div className="p-6 bg-white/10 dark:bg-black/10 rounded-3xl backdrop-blur-md border border-white/10 dark:border-black/5">
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 italic">Monthly Saving Goal</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-3xl font-black">78%</span>
                <div className="w-24 h-2 bg-white/20 dark:bg-black/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white dark:bg-black w-[78%]" />
                </div>
              </div>
            </div>

            <Link
              href="/debt-credit"
              className="w-full py-4 bg-white dark:bg-black text-black dark:text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Check Debts
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, currency }: any) {
  const isPositive = value >= 0;

  return (
    <div className="bg-card border border-border p-8 rounded-[2rem] hover:border-green-500/30 transition-all group overflow-hidden relative">
      <div className={`absolute top-0 left-0 w-full h-1 transition-all ${color === "green" ? "bg-green-500" : color === "red" ? "bg-red-500" : "bg-blue-500"
        }`} />

      <div className="flex items-start justify-between relative">
        <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${color === "green" ? "bg-green-500/10 text-green-500" : color === "red" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
          }`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black mt-2 tracking-tighter text-foreground">
            {currency} {Math.abs(value).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <span className={`flex items-center gap-1 font-bold ${isPositive ? "text-green-500" : "text-red-500"
          }`}>
          {isPositive ? "+" : "-"} 12.5%
          <TrendingUp className={`w-4 h-4 ${isPositive ? "" : "rotate-180"}`} />
        </span>
        <span className="text-muted-foreground font-medium opacity-60">vs last month</span>
      </div>
    </div>
  );
}
