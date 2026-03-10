"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Receipt,
    PiggyBank,
    HandCoins,
    ListTree,
    User,
    Sun,
    Moon
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Receipt, label: "Transactions", href: "/transactions" },
    { icon: ListTree, label: "Categories", href: "/categories" },
    { icon: PiggyBank, label: "Savings", href: "/savings" },
    { icon: HandCoins, label: "Debt & Credit", href: "/debt-credit" },
    { icon: User, label: "Profile", href: "/profile" },
];

export function SideNav() {
    const pathname = usePathname();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains("dark");
        setIsDark(isDarkMode);
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        if (newIsDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white/10 dark:bg-black/10 backdrop-blur-xl border-r border-green-500/20 px-4 py-8 flex flex-col items-center gap-8 z-50">
            <div className="flex items-center gap-2 mb-8 select-none">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                    <Receipt className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">
                    Expens<span className="text-green-500">Wise</span>
                </span>
            </div>

            <nav className="flex-1 w-full flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                                    ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                                    : "text-muted-foreground hover:bg-green-500/10 hover:text-green-500"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <button
                onClick={toggleTheme}
                className="w-full mt-auto flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-foreground/5 hover:bg-foreground/10 transition-all duration-300 group border border-green-500/10"
            >
                {isDark ? <Sun className="w-5 h-5 text-green-400" /> : <Moon className="w-5 h-5 text-green-600" />}
                <span className="font-medium text-foreground">
                    {isDark ? "Light Mode" : "Dark Mode"}
                </span>
            </button>
        </aside>
    );
}
