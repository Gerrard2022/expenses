"use client";

import { trpc } from "@/lib/trpc.client";
import {
    HandCoins,
    TrendingUp,
    TrendingDown,
    Trash2,
    History,
    AlertCircle,
    Clock,
    Plus,
    User,
    MoreVertical,
    CheckCircle2
} from "lucide-react";
import { useState } from "react";

export default function DebtCreditPage() {
    const [activeTab, setActiveTab] = useState<"debt" | "credit">("debt");
    const { data: list, refetch } = trpc.debtCredit.getAll.useQuery({ type: activeTab });
    const { data: user } = trpc.user.me.useQuery();

    const createDC = trpc.debtCredit.create.useMutation({
        onSuccess: () => refetch(),
    });

    const recordPayment = trpc.debtCredit.recordPayment.useMutation({
        onSuccess: () => refetch(),
    });

    const [showAdd, setShowAdd] = useState(false);

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await createDC.mutateAsync({
            type: activeTab,
            personName: formData.get("personName") as string,
            amount: Number(formData.get("amount")),
            dueDate: formData.get("dueDate") as string || undefined,
            notes: formData.get("notes") as string || undefined,
        });
        setShowAdd(false);
    };

    const [paymentAmount, setPaymentAmount] = useState<{ [key: string]: number }>({});

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-12 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-4">
                        Financial Relationships
                        <div className="flex items-center gap-2 p-1 bg-muted rounded-2xl">
                            <button
                                onClick={() => setActiveTab("debt")}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "debt" ? "bg-red-500 text-white shadow-xl shadow-red-500/20" : "text-muted-foreground hover:text-red-500"
                                    }`}
                            >
                                Debts
                            </button>
                            <button
                                onClick={() => setActiveTab("credit")}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "credit" ? "bg-green-500 text-white shadow-xl shadow-green-500/20" : "text-muted-foreground hover:text-green-500"
                                    }`}
                            >
                                Credits
                            </button>
                        </div>
                    </h1>
                    <p className="text-muted-foreground mt-4 italic font-medium">
                        {activeTab === "debt" ? "Keep track of money you owe to others." : "Manage loans you've given to friends or family."}
                    </p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className={`flex items-center gap-2 px-8 py-4 rounded-[1.5rem] font-bold transition-all shadow-xl active:scale-95 group ${activeTab === "debt" ? "bg-red-500 text-white shadow-red-500/20 hover:bg-red-600" : "bg-green-500 text-white shadow-green-500/20 hover:bg-green-600"
                        }`}
                >
                    {showAdd ? <Clock className="w-5 h-5 rotate-90" /> : <Plus className="w-5 h-5" />}
                    {showAdd ? "Later" : `Add New ${activeTab}`}
                </button>
            </div>

            {/* Add Form */}
            {showAdd && (
                <div className="bg-card border-l-8 border-l-red-500 dark:border-l-green-500 shadow-2xl rounded-[3rem] p-12 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform">
                        <HandCoins className="w-48 h-48" />
                    </div>

                    <h2 className="text-3xl font-black mb-10">Sync Record</h2>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Person Name</label>
                            <div className="relative">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                <input name="personName" placeholder="John Doe..." required className="w-full bg-background border border-border pl-12 pr-6 py-4 rounded-2xl shadow-sm" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Total Principal Amount</label>
                            <input name="amount" type="number" step="0.01" placeholder="0.00" required className="w-full bg-background border border-border p-4 rounded-2xl shadow-sm" />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Due Date</label>
                            <input name="dueDate" type="date" className="w-full bg-background border border-border p-4 rounded-2xl shadow-sm" />
                        </div>

                        <div className="md:col-span-2 lg:col-span-3 space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Context / Notes</label>
                            <input name="notes" placeholder="Why the exchange happened?" className="w-full bg-background border border-border p-4 rounded-2xl shadow-sm" />
                        </div>

                        <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-4">
                            <button
                                type="submit"
                                className={`px-12 py-5 rounded-3xl font-black text-lg transition-all shadow-xl hover:scale-105 ${activeTab === "debt" ? "bg-red-500 text-white shadow-red-500/30" : "bg-green-500 text-white shadow-green-500/30"
                                    }`}
                            >
                                Confirm Record
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {list?.map((dc) => {
                    const totalAmount = Number(dc.amount);
                    const paidAmount = Number(dc.paidAmount);
                    const remaining = totalAmount - paidAmount;
                    const progress = (paidAmount / totalAmount) * 100;
                    const isOverdue = dc.dueDate && new Date(dc.dueDate) < new Date() && dc.status !== "paid";

                    return (
                        <div key={dc.id} className="bg-card border border-border rounded-[3rem] p-10 hover:border-green-500/20 transition-all shadow-sm relative overflow-hidden group/item">
                            <div className="absolute top-0 right-0 p-10 opacity-5">
                                {activeTab === "debt" ? <TrendingDown className="w-24 h-24 text-red-500" /> : <TrendingUp className="w-24 h-24 text-green-500" />}
                            </div>

                            <div className="flex items-center justify-between relative">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-inner ${activeTab === "debt" ? "bg-red-500/10 text-red-500 italic" : "bg-green-500/10 text-green-500"
                                        }`}>
                                        {dc.personName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-foreground">{dc.personName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${dc.status === "paid" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                                                }`}>
                                                {dc.status?.replace("_", " ")}
                                            </span>
                                            {isOverdue && (
                                                <span className="text-[10px] font-black uppercase bg-red-500 text-white px-2 py-1 rounded-md flex items-center gap-1 animate-pulse">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Overdue
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button className="p-3 hover:bg-muted rounded-xl transition-all">
                                    <MoreVertical className="w-5 h-5 text-muted-foreground opacity-30" />
                                </button>
                            </div>

                            <div className="mt-10 space-y-6 relative">
                                <div className="flex items-center justify-between text-sm font-bold opacity-60">
                                    <span>Settlement Ratio</span>
                                    <span>{progress.toFixed(0)}%</span>
                                </div>
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${activeTab === "debt" ? "bg-red-500" : "bg-green-500"
                                            }`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40 italic">Principal Amount</p>
                                        <p className="text-3xl font-black mt-2">
                                            {user?.currency || "USD"} {totalAmount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40 italic">Remaining</p>
                                        <p className={`text-3xl font-black mt-2 ${remaining > 0 ? (activeTab === "debt" ? "text-red-500" : "text-green-500") : "text-foreground opacity-20"}`}>
                                            {user?.currency || "USD"} {remaining.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex items-center gap-4 relative">
                                {dc.status !== "paid" ? (
                                    <>
                                        <div className="relative flex-1">
                                            <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                                            <input
                                                type="number"
                                                placeholder={`Record ${activeTab === "debt" ? "repayment" : "collection"}...`}
                                                className="w-full bg-background border border-border pl-12 pr-6 py-4 rounded-2xl font-bold focus:border-green-500/50"
                                                value={paymentAmount[dc.id] || ""}
                                                onChange={(e) => setPaymentAmount({ ...paymentAmount, [dc.id]: Number(e.target.value) })}
                                            />
                                        </div>
                                        <button
                                            onClick={() => recordPayment.mutate({ id: dc.id, amount: paymentAmount[dc.id] || 0 })}
                                            disabled={recordPayment.isPending}
                                            className={`px-8 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-xl disabled:opacity-50 ${activeTab === "debt" ? "bg-red-500 text-white shadow-red-500/30" : "bg-green-500 text-white shadow-green-500/30"
                                                }`}
                                        >
                                            Process
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full py-4 bg-muted border border-border/10 rounded-2xl flex items-center justify-center gap-3 italic font-bold text-muted-foreground/40 animate-pulse">
                                        <CheckCircle2 className="w-5 h-5 opacity-40 text-green-500" />
                                        Fully Reconciled
                                    </div>
                                )}
                            </div>

                            {dc.notes && (
                                <div className="mt-8 pt-8 border-t border-border/5 text-sm text-muted-foreground/60 italic flex items-center gap-2">
                                    <History className="w-4 h-4 opacity-20" />
                                    {dc.notes}
                                </div>
                            )}
                        </div>
                    );
                })}

                {(!list || list.length === 0) && (
                    <div className="xl:col-span-2 py-40 border-2 border-dashed border-border rounded-[3rem] text-center flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity space-y-6">
                        <HandCoins className="w-24 h-24 text-muted-foreground" />
                        <div>
                            <h3 className="text-2xl font-black">Crystal Clear Balance</h3>
                            <p className="mt-2 italic">No active {activeTab}s recorded at the moment.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
