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
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense, currentSavings, activeDebts, currency: user?.currency || "USD" };
  }, [transactions, savings, debts, user]);

  const recentTransactions = transactions?.slice(0, 8) || [];

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        <StatCard label="Balance" value={stats.balance} currency={stats.currency} icon={Wallet} />
        <StatCard label="Income" value={stats.totalIncome} currency={stats.currency} icon={TrendingUp} />
        <StatCard label="Expenses" value={stats.totalExpense} currency={stats.currency} icon={TrendingDown} />
        <StatCard label="Savings" value={stats.currentSavings} currency={stats.currency} icon={PiggyBank} />
      </div>

      {/* Recent Transactions */}
      <Card>
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
                    {tx.type === "income" ? "+" : "-"}{stats.currency} {Number(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
              <Link
                href="/transactions"
                className={cn(buttonVariants({ variant: "link" }), "mt-1 h-auto p-0 text-xs")}
              >
                Add your first
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debt alert */}
      {stats.activeDebts > 0 && (
        <Card className="border-destructive/20">
          <CardContent className="flex items-center justify-between py-4 px-6">
            <div>
              <p className="text-sm font-medium">Outstanding debt</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.currency} {stats.activeDebts.toLocaleString()} pending
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
          {currency} {Math.abs(value).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
