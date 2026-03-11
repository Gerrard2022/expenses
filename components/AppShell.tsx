"use client";

import { usePathname } from "next/navigation";
import { SideNav } from "@/components/SideNav";
import { AuthGuard } from "@/components/AuthGuard";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/auth");

    if (isAuthPage) {
        return <div className="min-h-screen bg-background">{children}</div>;
    }

    return (
        <AuthGuard>
            <div className="flex bg-background min-h-screen">
                <SideNav />
                <main className="flex-1 ml-60 p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
