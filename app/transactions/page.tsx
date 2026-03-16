"use client";

import { trpc } from "@/lib/trpc.client";
import {
    Plus,
    Search,
    Trash2,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar as CalendarIcon,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useCurrencyStore } from "@/stores/currency.store";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
    const [filter, setFilter] = useState<{ type?: any; categoryId?: string }>({});
    const { data: transactions, refetch } = trpc.transaction.getAll.useQuery(filter);
    const { data: categories } = trpc.category.getAll.useQuery();
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date>(new Date());
    const currency = useCurrencyStore((s) => s.currency);

    const createTransaction = trpc.transaction.create.useMutation({
        onSuccess: () => { refetch(); setOpen(false); setDate(new Date()); },
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
            fee: Number(formData.get("fee")) || 0,
            type: formData.get("type") as any,
            paymentMode: formData.get("paymentMode") as any || "hand",
            date: date.toISOString(),
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
                                    <Label htmlFor="tx-amount">Amount ({getCurrencySymbol(currency)})</Label>
                                    <Input id="tx-amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="tx-fee">Fee ({getCurrencySymbol(currency)})</Label>
                                    <Input id="tx-fee" name="fee" type="number" step="0.01" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Type</Label>
                                    <Select name="type" defaultValue="expense">
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="expense">Expense</SelectItem>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="saving">Saving</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Payment Mode</Label>
                                    <Select name="paymentMode" defaultValue="hand">
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="momo">MoMo</SelectItem>
                                            <SelectItem value="bank">Bank</SelectItem>
                                            <SelectItem value="hand">Hand</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Category</Label>
                                    <Select name="categoryId">
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="No category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">No category</SelectItem>
                                            {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Date</Label>
                                    <Popover>
                                        <PopoverTrigger
                                            render={
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            }
                                        />
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={(d) => d && setDate(d)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
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
                                                {tx.paymentMode && ` · via ${tx.paymentMode}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className={`text-sm font-medium tabular-nums ${tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                                {tx.type === "income" ? "+" : "-"}{formatCurrency(Number(tx.amount), currency)}
                                            </p>
                                            {Number(tx.fee) > 0 && (
                                                <p className="text-[10px] text-muted-foreground">Fee: {formatCurrency(Number(tx.fee), currency)}</p>
                                            )}
                                        </div>
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
