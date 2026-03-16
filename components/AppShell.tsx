"use client";

import { usePathname } from "next/navigation";
import { SideNav, NavContent } from "@/components/SideNav";
import { AuthGuard } from "@/components/AuthGuard";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Receipt } from "lucide-react";
import { useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/auth");
    const [open, setOpen] = useState(false);

    if (isAuthPage) {
        return <div className="min-h-screen bg-background">{children}</div>;
    }

    return (
        <AuthGuard>
            <div className="flex bg-background min-h-screen relative">
                {/* Desktop Sidebar */}
                <SideNav />

                {/* Mobile Header */}
                <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-background/80 backdrop-blur-md z-40 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-base font-bold tracking-tight">ExpensWise</span>
                    </div>
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger
                            render={
                                <Button variant="ghost" size="icon">
                                    <Menu className="w-5 h-5" />
                                </Button>
                            }
                        />
                        <SheetContent side="left" className="p-0 border-r-0 w-72">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Navigation Menu</SheetTitle>
                            </SheetHeader>
                            <NavContent onItemClick={() => setOpen(false)} />
                        </SheetContent>
                    </Sheet>
                </div>

                <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
