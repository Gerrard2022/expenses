"use client";

import { trpc } from "@/lib/trpc.client";
import {
    User,
    Mail,
    MapPin,
    CreditCard,
    Settings,
    Github,
    Globe,
    Camera,
    Save,
    Wallet,
    Sparkles,
    ChevronRight,
    TrendingUp,
    TrendingDown
} from "lucide-react";

export default function ProfilePage() {
    const { data: user, refetch } = trpc.user.me.useQuery();
    const updateProfile = trpc.user.update.useMutation({
        onSuccess: () => refetch(),
    });

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await updateProfile.mutateAsync({
            name: formData.get("name") as string,
            currency: formData.get("currency") as string,
        });
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-12 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-10 bg-card border border-border p-12 rounded-[3.5rem] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform">
                    <Wallet className="w-56 h-56 text-green-500" />
                </div>

                <div className="relative group/avatar">
                    <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-7xl font-black text-white shadow-2xl relative z-10">
                        {user?.name?.charAt(0).toUpperCase() || <User size={64} />}
                    </div>
                    <button className="absolute bottom-[-10px] right-[-10px] p-4 bg-foreground text-background dark:bg-white dark:text-black rounded-2xl shadow-xl z-20 hover:scale-110 active:scale-95 transition-all group-hover/avatar:rotate-12">
                        <Camera className="w-6 h-6" />
                    </button>
                    <div className="absolute inset-0 bg-green-500 rounded-[2.5rem] blur-2xl opacity-20 -z-10 group-hover/avatar:opacity-40 transition-opacity animate-pulse" />
                </div>

                <div className="text-center md:text-left relative">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-green-500 italic flex items-center gap-2 mb-2 justify-center md:justify-start">
                        <Sparkles className="w-4 h-4" />
                        Verified User Node
                    </span>
                    <h1 className="text-6xl font-black tracking-tighter text-foreground leading-none">
                        {user?.name || "Member Name"}
                    </h1>
                    <p className="text-xl text-muted-foreground mt-4 flex items-center gap-3 justify-center md:justify-start">
                        <Mail className="w-5 h-5 text-green-500/60" />
                        {user?.email || "email@domain.com"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Settings Form */}
                <div className="lg:col-span-2 bg-card border border-border rounded-[3rem] p-12 shadow-sm group">
                    <h2 className="text-3xl font-black mb-10 flex items-center gap-4">
                        <Settings className="w-8 h-8 text-green-500" />
                        Identity Management
                    </h2>
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">Public Name</label>
                            <input name="name" defaultValue={user?.name} className="w-full bg-background border border-border p-5 rounded-[1.5rem] font-bold focus:border-green-500/50 shadow-inner" />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">App Currency</label>
                            <select name="currency" defaultValue={user?.currency || "USD"} className="w-full bg-background border border-border p-5 rounded-[1.5rem] font-bold focus:border-green-500/50 shadow-inner appearance-none">
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="JPY">JPY (¥)</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 pt-10 border-t border-border/50">
                            <button type="submit" disabled={updateProfile.isPending} className="w-full py-6 bg-green-500 text-white rounded-[2rem] font-black text-xl hover:shadow-2xl hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-4 group">
                                {updateProfile.isPending ? "Syncing Identity..." : "Commit Changes"}
                                <Save className="w-6 h-6 transition-transform group-hover:scale-110" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Meta Stats/Profile Badge */}
                <div className="space-y-8 flex flex-col justify-between">
                    <div className="bg-black text-white dark:bg-white dark:text-black p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-[-10%] left-[-10%] w-32 h-32 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
                        <div className="relative">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Dashboard</p>
                            <div className="mt-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold opacity-60 flex items-center gap-2">
                                        <Globe size={16} /> Location
                                    </span>
                                    <span className="font-black text-green-500">Global / Cloud</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold opacity-60 flex items-center gap-2">
                                        <Github size={16} /> GitHub ID
                                    </span>
                                    <span className="font-black truncate w-24 text-right hover:underline cursor-pointer">@member_node</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold opacity-60 flex items-center gap-2">
                                        <CreditCard size={16} /> Tier
                                    </span>
                                    <span className="bg-green-500 text-white dark:text-black font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-lg shadow-green-500/20">Elite Cloud</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border-2 border-green-500/10 p-10 rounded-[3rem] text-center space-y-4 hover:border-green-500/30 transition-all flex-1 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 shadow-inner">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black">Efficiency Index</h4>
                            <p className="text-sm font-bold text-muted-foreground mt-1">94% of targets met this month</p>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-4">
                            <div className="h-full bg-green-500 w-[94%]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
