"use client";

import { trpc } from "@/lib/trpc.client";
import {
    Plus,
    Search,
    Trash2,
    ArrowUpRight,
    ArrowDownLeft,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function TransactionsPage() {
    const [filter, setFilter] = useState<{ type?: any; categoryId?: string }>({});
    const { data: transactions, refetch } = trpc.transaction.getAll.useQuery(filter);
    const { data: categories } = trpc.category.getAll.useQuery();
    const { data: user } = trpc.user.me.useQuery();
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);

    const createTransaction = trpc.transaction.create.useMutation({
        onSuccess: () => { refetch(); setOpen(false); },
    });

    const deleteTransaction = trpc.transaction.delete.useMutation({
        onSuccess: () => refetch(),
    });

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await createTransaction.mutateAsync({
            name: formData.get("name") as string,
            amount: Number(formData.get("amount")),
            type: formData.get("type") as any,
            date: new Date().toISOString(),
            categoryId: formData.get("categoryId") as string || undefined,
            notes: formData.get("notes") as string || undefined,
        });
    };

    const filtered = transactions?.filter(tx =>
        tx.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const types = ["all", "income", "expense"];

    return (
        <div className="space-y-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Transactions</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Track and manage your cash flow.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button>
                                <Plus className="w-4 h-4 mr-1.5" />
                                New transaction
                            </Button>
                        }
                    />
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add transaction</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="tx-name">Label</Label>
                                <Input id="tx-name" name="name" placeholder="e.g. Netflix, Rent, Salary" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="tx-amount">Amount ({user?.currency || "USD"})</Label>
                                    <Input id="tx-amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="tx-type">Type</Label>
                                    <select id="tx-type" name="type" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                        <option value="saving">Saving</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="tx-category">Category</Label>
                                <select id="tx-category" name="categoryId" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                                    <option value="">No category</option>
                                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="tx-notes">Notes</Label>
                                <Input id="tx-notes" name="notes" placeholder="Optional notes" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" size="sm" disabled={createTransaction.isPending}>
                                    {createTransaction.isPending ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1 p-1 bg-muted rounded-md w-fit">
                    {types.map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t === "all" ? {} : { type: t })}
                            className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${(filter.type || "all") === t
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                        {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {filtered.length > 0 ? (
                        <div className="divide-y divide-border">
                            {filtered.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between px-6 py-3 group">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                                            {tx.type === "income" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{tx.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {categories?.find(c => c.id === tx.categoryId)?.name || "Uncategorized"} · {new Date(tx.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-sm font-medium tabular-nums ${tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                            {tx.type === "income" ? "+" : "-"}{user?.currency || "USD"} {Number(tx.amount).toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => deleteTransaction.mutate({ id: tx.id })}
                                            disabled={deleteTransaction.isPending}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center">
                            <p className="text-sm text-muted-foreground">No transactions found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
