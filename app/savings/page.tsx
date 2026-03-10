"use client";

import { trpc } from "@/lib/trpc.client";
import {
    PiggyBank,
    Plus,
    Target,
    Calendar,
    Sparkles,
    ArrowUpRight,
    TrendingUp,
    Clock,
    Trash2
} from "lucide-react";
import { useState } from "react";

export default function SavingsPage() {
    const { data: savings, refetch } = trpc.saving.getAll.useQuery();
    const { data: user } = trpc.user.me.useQuery();
    const [showAdd, setShowAdd] = useState(false);

    const createSaving = trpc.saving.create.useMutation({
        onSuccess: () => refetch(),
    });

    const depositSaving = trpc.saving.deposit.useMutation({
        onSuccess: () => refetch(),
    });

    const deleteSaving = trpc.saving.delete.useMutation({
        onSuccess: () => refetch(),
    });

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await createSaving.mutateAsync({
            name: formData.get("name") as string,
            targetAmount: Number(formData.get("targetAmount")),
            currentAmount: Number(formData.get("currentAmount")) || 0,
            deadline: formData.get("deadline") as string || undefined,
        });
        setShowAdd(false);
    };

    const [depositAmount, setDepositAmount] = useState<{ [key: string]: number }>({});

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-green-500/80">
                        Saving Goals
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-green-500" />
                        Watch your future grow, one step at a time.
                    </p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-[2rem] font-black hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-95 group"
                >
                    {showAdd ? <Clock className="w-5 h-5 rotate-90" /> : <Plus className="w-5 h-5" />}
                    {showAdd ? "Later" : "New Goal"}
                </button>
            </div>

            {/* Add Form */}
            {showAdd && (
                <div className="bg-card border-2 border-green-500/10 rounded-[3rem] p-12 animate-in fade-in zoom-in-95 duration-500 shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/[0.03] to-transparent pointer-events-none" />
                    <h2 className="text-3xl font-black mb-10 flex items-center gap-3">
                        <PiggyBank className="w-10 h-10 text-green-500 bg-green-500/10 p-2 rounded-2xl shadow-inner" />
                        Define Your Target
                    </h2>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-10 relative">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">What are you saving for?</label>
                            <input name="name" placeholder="Tesla Model S, New Home..." required className="w-full bg-background border border-border p-5 rounded-3xl focus:border-green-500/50 shadow-sm" />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Target Amount ({user?.currency || "USD"})</label>
                            <input name="targetAmount" type="number" placeholder="50000.00" required className="w-full bg-background border border-border p-5 rounded-3xl focus:border-green-500/50 shadow-sm" />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Initial Deposit (Optional)</label>
                            <input name="currentAmount" type="number" placeholder="0.00" className="w-full bg-background border border-border p-5 rounded-3xl focus:border-green-500/50 shadow-sm" />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Deadline (Optional)</label>
                            <input name="deadline" type="date" className="w-full bg-background border border-border p-5 rounded-3xl focus:border-green-500/50 shadow-sm" />
                        </div>

                        <div className="md:col-span-2 mt-6">
                            <button type="submit" className="w-full py-6 bg-foreground text-background dark:bg-white dark:text-black rounded-[2rem] font-black text-xl hover:shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3">
                                Setup Goal
                                <ArrowUpRight className="w-6 h-6" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Goals Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {savings?.map((s) => {
                    const progress = s.targetAmount ? (Number(s.currentAmount) / Number(s.targetAmount)) * 100 : 0;
                    return (
                        <div key={s.id} className="bg-card border border-border rounded-[3rem] p-10 hover:border-green-500/40 transition-all hover:bg-green-500/[0.01] overflow-hidden relative group/card shadow-sm hover:shadow-xl">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover/card:opacity-10 transition-opacity">
                                <Target className="w-32 h-32 text-green-500" />
                            </div>

                            <div className="flex items-start justify-between relative">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500 italic bg-green-500/10 px-3 py-1 rounded-full mb-3 inline-block">Goal Active</span>
                                    <h3 className="text-3xl font-black text-foreground">{s.name}</h3>
                                </div>
                                <button
                                    onClick={() => deleteSaving.mutate({ id: s.id })}
                                    className="p-4 bg-red-500/10 text-red-500 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mt-10 space-y-4 relative">
                                <div className="flex items-center justify-between text-sm font-bold opacity-60">
                                    <span>Progress</span>
                                    <span>{progress.toFixed(1)}%</span>
                                </div>
                                <div className="h-6 w-full bg-muted rounded-full p-1.5 shadow-inner overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse"
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-2xl font-black text-foreground">
                                        {user?.currency || "USD"} {Number(s.currentAmount).toLocaleString()}
                                        <span className="text-muted-foreground/40 font-bold ml-2">/ {Number(s.targetAmount).toLocaleString()}</span>
                                    </p>
                                    {s.deadline && (
                                        <div className="flex items-center gap-2 text-xs font-black text-muted-foreground bg-muted px-4 py-2 rounded-xl">
                                            <Calendar className="w-4 h-4 opacity-40 text-green-500" />
                                            {new Date(s.deadline).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-10 flex items-center gap-4 relative">
                                <div className="relative flex-1">
                                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 opacity-60" />
                                    <input
                                        type="number"
                                        placeholder="Top up amount..."
                                        className="w-full bg-background border border-border pl-12 pr-6 py-4 rounded-2xl font-bold focus:border-green-500/50"
                                        value={depositAmount[s.id] || ""}
                                        onChange={(e) => setDepositAmount({ ...depositAmount, [s.id]: Number(e.target.value) })}
                                    />
                                </div>
                                <button
                                    onClick={() => depositSaving.mutate({ id: s.id, amount: depositAmount[s.id] || 0 })}
                                    disabled={depositSaving.isPending}
                                    className="px-8 py-4 bg-foreground text-background dark:bg-white dark:text-black rounded-2xl font-black hover:shadow-lg active:scale-95 transition-all flex items-center gap-2"
                                >
                                    Deposit
                                    <TrendingUp className="w-5 h-5" />
                                </button>
                            </div>

                            {progress >= 100 && (
                                <div className="absolute inset-0 bg-green-500/10 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-500 z-10">
                                    <div className="bg-white dark:bg-black p-10 rounded-[2.5rem] shadow-2xl border-4 border-green-500 text-center scale-110">
                                        <Sparkles className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
                                        <h4 className="text-3xl font-black text-foreground">Goal Achieved!</h4>
                                        <p className="text-muted-foreground mt-2 mb-6">Congratulations on your consistency.</p>
                                        <button onClick={() => deleteSaving.mutate({ id: s.id })} className="text-sm font-black text-red-500 bg-red-500/10 px-6 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all">Claim & Finish</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {(!savings || savings.length === 0) && (
                    <div className="xl:col-span-2 py-40 bg-card border-2 border-dashed border-border rounded-[3rem] flex flex-col items-center justify-center space-y-6 opacity-60 group hover:opacity-100 transition-opacity">
                        <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center group-hover:bg-green-500/10 group-hover:scale-110 transition-all">
                            <PiggyBank className="w-16 h-16 text-muted-foreground group-hover:text-green-500" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black">Empty Savings Vault</h3>
                            <p className="text-muted-foreground mt-1 italic font-medium">Future wealth starts with the first cent. Don't wait.</p>
                        </div>
                        <button onClick={() => setShowAdd(true)} className="px-10 py-4 bg-green-500 text-white rounded-2xl font-black hover:bg-green-600 transition-all shadow-xl shadow-green-500/20">Create My First Goal</button>
                    </div>
                )}
            </div>
        </div>
    );
}

function DollarSign(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}
