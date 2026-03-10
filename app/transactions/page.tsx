"use client";

import { trpc } from "@/lib/trpc.client";
import {
    Plus,
    Search,
    Filter,
    Trash2,
    Edit3,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Layers,
    StickyNote,
    DollarSign,
    Receipt
} from "lucide-react";
import { useState } from "react";

export default function TransactionsPage() {
    const [filter, setFilter] = useState<{ type?: any; categoryId?: string }>({});
    const { data: transactions, refetch } = trpc.transaction.getAll.useQuery(filter);
    const { data: categories } = trpc.category.getAll.useQuery();
    const { data: user } = trpc.user.me.useQuery();

    const createTransaction = trpc.transaction.create.useMutation({
        onSuccess: () => refetch(),
    });

    const deleteTransaction = trpc.transaction.delete.useMutation({
        onSuccess: () => refetch(),
    });

    const [showAdd, setShowAdd] = useState(false);

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            amount: Number(formData.get("amount")),
            type: formData.get("type") as any,
            date: new Date().toISOString(),
            categoryId: formData.get("categoryId") as string || undefined,
            notes: formData.get("notes") as string || undefined,
        };
        await createTransaction.mutateAsync(data);
        setShowAdd(false);
    };

    return (
        <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-green-500">
                        Transaction History
                    </h1>
                    <p className="text-muted-foreground mt-2 leading-relaxed max-w-md">
                        Easily manage and audit your cash flow. Filter by category, type, or date.
                    </p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-[1.5rem] font-bold hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-95 group"
                >
                    {showAdd ? <ChevronRight className="w-5 h-5 rotate-90" /> : <Plus className="w-5 h-5" />}
                    {showAdd ? "Close Form" : "Create Transaction"}
                </button>
            </div>

            {/* Add Form (Expandable) */}
            {showAdd && (
                <div className="bg-card border-2 border-green-500/10 rounded-[2.5rem] p-10 animate-in slide-in-from-top-12 duration-500 shadow-2xl shadow-green-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                        <DollarSign className="w-48 h-48 text-green-500" />
                    </div>

                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <Plus className="w-6 h-6 text-green-500 bg-green-500/10 p-1 rounded-lg" />
                        New Transaction
                    </h2>

                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Label / Merchant</label>
                            <input name="name" placeholder="Netflix, Rent, Salary..." required className="w-full bg-background border-2 border-border/50 p-4 rounded-2xl focus:border-green-500/50" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Amount ({user?.currency || "USD"})</label>
                            <input name="amount" type="number" step="0.01" placeholder="0.00" required className="w-full bg-background border-2 border-border/50 p-4 rounded-2xl focus:border-green-500/50" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Type</label>
                            <select name="type" className="w-full bg-background border-2 border-border/50 p-4 rounded-2xl focus:border-green-500/50 appearance-none">
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                                <option value="saving">Saving</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                            <select name="categoryId" className="w-full bg-background border-2 border-border/50 p-4 rounded-2xl focus:border-green-500/50">
                                <option value="">No Category</option>
                                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Notes (Optional)</label>
                            <input name="notes" placeholder="Any additional details..." className="w-full bg-background border-2 border-border/50 p-4 rounded-2xl focus:border-green-500/50" />
                        </div>

                        <div className="md:col-span-2 lg:col-span-3 pt-4">
                            <button type="submit" disabled={createTransaction.isPending} className="w-full py-5 bg-foreground text-background dark:bg-white dark:text-black rounded-3xl font-black text-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                                {createTransaction.isPending ? "Syncing..." : "Confirm & Save"}
                                <ArrowUpRight className="w-6 h-6" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Main List */}
            <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm relative group overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-50" />
                        <input
                            placeholder="Search by label or notes..."
                            className="w-full pl-14 pr-6 py-4 bg-background border-2 border-border/40 rounded-2xl focus:border-green-500/40 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-4 bg-background border-2 border-border rounded-2xl hover:border-green-500/50 hover:text-green-500 transition-all">
                            <Filter className="w-5 h-5" />
                        </button>
                        <div className="h-10 w-[2px] bg-border mx-2 hidden md:block" />
                        <div className="flex items-center gap-2 p-1 bg-background border-2 border-border rounded-2xl">
                            {["all", "income", "expense"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t === "all" ? {} : { type: t })}
                                    className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${(filter.type || "all") === t
                                        ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                                        : "text-muted-foreground hover:text-green-500"
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {transactions && transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <div key={tx.id} className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 p-6 bg-background/50 border border-border/50 rounded-2xl hover:border-green-500/30 hover:bg-green-500/[0.01] transition-all group/item">

                                <div className="md:col-span-5 flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover/item:scale-110 shadow-inner ${tx.type === "income" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                        }`}>
                                        {tx.type === "income" ? <ArrowUpRight className="w-7 h-7" /> : <ArrowDownLeft className="w-7 h-7" />}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg text-foreground truncate max-w-[200px]">{tx.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest py-1 px-2 rounded-md bg-muted text-muted-foreground flex items-center gap-1">
                                                <Layers className="w-3 h-3" />
                                                {categories?.find(c => c.id === tx.categoryId)?.name || "Uncategorized"}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-2">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(tx.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-3 px-4 hidden md:block">
                                    <p className="text-sm text-muted-foreground italic truncate flex items-center gap-2">
                                        <StickyNote className="w-4 h-4 opacity-30" />
                                        {tx.notes || "No notes"}
                                    </p>
                                </div>

                                <div className="md:col-span-2 text-right md:text-center">
                                    <p className={`text-xl font-black ${tx.type === "income" ? "text-green-500" : "text-red-500"
                                        }`}>
                                        {tx.type === "income" ? "+" : "-"}{user?.currency || "USD"} {Number(tx.amount).toLocaleString()}
                                    </p>
                                </div>

                                <div className="md:col-span-2 flex justify-end gap-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <button className="p-3 bg-muted rounded-xl hover:bg-green-500 hover:text-white transition-all">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteTransaction.mutate({ id: tx.id })}
                                        disabled={deleteTransaction.isPending}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-32 text-center rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center justify-center space-y-4">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                                <Receipt className="w-10 h-10 text-muted-foreground opacity-20" />
                            </div>
                            <p className="text-muted-foreground font-medium text-lg italic">No transactions found. Start spending!</p>
                            <button onClick={() => setShowAdd(true)} className="text-green-500 font-bold hover:underline">Create your first now</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
