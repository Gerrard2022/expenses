"use client";

import { trpc } from "@/lib/trpc.client";
import {
    Plus,
    Trash2,
    Layers,
    Sparkles,
    Edit3,
    Palette,
    Tag,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    LayoutGrid
} from "lucide-react";
import { useState } from "react";

const colors = [
    "#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4"
];

export default function CategoriesPage() {
    const { data: categories, refetch } = trpc.category.getAll.useQuery();
    const { data: transactions } = trpc.transaction.getAll.useQuery();

    const createCategory = trpc.category.create.useMutation({
        onSuccess: () => refetch(),
    });

    const deleteCategory = trpc.category.delete.useMutation({
        onSuccess: () => refetch(),
    });

    const [showAdd, setShowAdd] = useState(false);
    const [selectedColor, setSelectedColor] = useState(colors[0]);

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await createCategory.mutateAsync({
            name: formData.get("name") as string,
            color: selectedColor,
            icon: "tag", // Default for now
        });
        setShowAdd(false);
    };

    const getStatsForCategory = (id: string) => {
        const categoryTxs = transactions?.filter(t => t.categoryId === id) || [];
        const total = categoryTxs.reduce((acc, t) => acc + Number(t.amount), 0);
        const count = categoryTxs.length;
        return { total, count };
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-green-500">
                        Structure your Spending
                    </h1>
                    <p className="text-muted-foreground mt-2 leading-relaxed font-bold italic opacity-60">
                        Design a custom hierarchy that matches your lifestyle and reporting needs.
                    </p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-[1.5rem] font-black hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-95 group"
                >
                    {showAdd ? <ChevronRight className="w-5 h-5 rotate-90" /> : <Plus className="w-5 h-5" />}
                    {showAdd ? "Later" : "Build Category"}
                </button>
            </div>

            {/* Add Form */}
            {showAdd && (
                <div className="bg-card border-l-4 border-l-green-500 rounded-[2.5rem] p-10 animate-in slide-in-from-top-12 duration-500 shadow-2xl relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
                        <Layers className="w-48 h-48 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                        <Palette className="w-6 h-6 text-green-500" />
                        New Classification
                    </h2>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-10 relative">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visible Label</label>
                            <input name="name" placeholder="Dining, Entertainment, Groceries..." required className="w-full bg-background border-2 border-border/50 p-4 rounded-2xl focus:border-green-500/50 shadow-sm" />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visual Identity / Color</label>
                            <div className="flex items-center gap-4">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setSelectedColor(c)}
                                        className={`w-10 h-10 rounded-xl transition-all hover:scale-125 hover:rotate-12 ${selectedColor === c ? "ring-4 ring-green-500/20 shadow-lg scale-110" : "scale-90"
                                            }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                disabled={createCategory.isPending}
                                className="w-full py-5 bg-foreground text-background dark:bg-white dark:text-black rounded-3xl font-black text-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-xl"
                            >
                                {createCategory.isPending ? "Creating..." : "Confirm & Launch"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories?.map((c) => {
                    const stats = getStatsForCategory(c.id);
                    return (
                        <div key={c.id} className="bg-card border border-border rounded-[2.5rem] p-10 hover:border-green-500/30 transition-all shadow-sm hover:shadow-xl group/card relative overflow-hidden">
                            <div
                                className="absolute top-0 left-0 w-full h-1.5 opacity-50 transition-all group-hover/card:h-2"
                                style={{ backgroundColor: c.color || "#22c55e" }}
                            />

                            <div className="flex items-center justify-between relative">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl shadow-inner flex items-center justify-center transition-transform group-hover/card:scale-110 group-hover/card:rotate-6" style={{ backgroundColor: `${c.color}20`, color: c.color || "#22c55e" }}>
                                        <Tag className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground">{c.name}</h3>
                                </div>
                                <button
                                    onClick={() => deleteCategory.mutate({ id: c.id })}
                                    className="p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover/card:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mt-10 grid grid-cols-2 gap-4 relative">
                                <div className="p-4 bg-muted rounded-2xl border border-border/5 group-hover/card:border-green-500/10 transition-all">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 italic">Total Lifetime</p>
                                    <p className="text-xl font-black mt-2 leading-none">{stats.total.toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-muted rounded-2xl border border-border/5 group-hover/card:border-green-500/10 transition-all">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50 italic">Transactions</p>
                                    <p className="text-xl font-black mt-2 leading-none">{stats.count}</p>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between text-xs font-bold text-muted-foreground opacity-30 italic relative leading-relaxed">
                                <span>Active Node</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Reporting Data
                                </div>
                            </div>

                            <div className="absolute bottom-[-10%] right-[-10%] opacity-[0.02] rotate-12 group-hover/card:scale-125 transition-transform duration-1000">
                                <LayoutGrid className="w-40 h-40" />
                            </div>
                        </div>
                    );
                })}

                {(!categories || categories.length === 0) && (
                    <div className="md:col-span-2 lg:col-span-3 py-40 border-2 border-dashed border-border rounded-[3rem] text-center flex flex-col items-center justify-center space-y-6 opacity-40 hover:opacity-100 transition-opacity">
                        <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center group-hover:bg-green-500/10 group-hover:scale-110 transition-all">
                            <Sparkles className="w-16 h-16 text-muted-foreground group-hover:text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black">Design Your Schema</h3>
                            <p className="mt-1 italic">Personalize your expense reports today.</p>
                        </div>
                        <button onClick={() => setShowAdd(true)} className="px-10 py-5 bg-green-500 text-white rounded-2xl font-black hover:bg-green-600 transition-all shadow-xl shadow-green-500/20">Init My First Category</button>
                    </div>
                )}
            </div>
        </div>
    );
}
