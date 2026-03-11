"use client";

import { trpc } from "@/lib/trpc.client";
import {
    HandCoins,
    TrendingUp,
    TrendingDown,
    Trash2,
    Calendar,
    Plus,
    User,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCurrencyStore } from "@/stores/currency.store";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

export default function DebtCreditPage() {
    const [activeTab, setActiveTab] = useState<"debt" | "credit">("debt");
    const { data: list, refetch } = trpc.debtCredit.getAll.useQuery({ type: activeTab });
    const [open, setOpen] = useState(false);
    const [payOpen, setPayOpen] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>("");
    const currency = useCurrencyStore((s) => s.currency);

    const createDC = trpc.debtCredit.create.useMutation({
        onSuccess: () => { refetch(); setOpen(false); },
    });

    const recordPayment = trpc.debtCredit.recordPayment.useMutation({
        onSuccess: () => { refetch(); setPayOpen(null); setAmount(""); },
    });

    const deleteDC = trpc.debtCredit.delete.useMutation({
        onSuccess: () => refetch(),
    });

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
    };

    const handleRecord = async (id: string) => {
        if (!amount || isNaN(Number(amount))) return;
        await recordPayment.mutateAsync({ id, amount: Number(amount) });
    };

    return (
        <div className="space-y-6 py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Debt & Credit</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Manage money you owe or are owed.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 p-1 bg-muted rounded-md shrink-0">
                        <button
                            onClick={() => setActiveTab("debt")}
                            className={cn(
                                "px-3 py-1 rounded text-xs font-medium transition-colors",
                                activeTab === "debt"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Debt
                        </button>
                        <button
                            onClick={() => setActiveTab("credit")}
                            className={cn(
                                "px-3 py-1 rounded text-xs font-medium transition-colors",
                                activeTab === "credit"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Credit
                        </button>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger
                            render={
                                <Button>
                                    <Plus className="w-4 h-4 mr-1.5" />
                                    New record
                                </Button>
                            }
                        />
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>New {activeTab} record</DialogTitle>
                                <DialogDescription className="text-xs">
                                    {activeTab === "debt" ? "Money you owe to someone." : "Money someone owes you."}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAdd} className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="dc-person">Person</Label>
                                    <Input id="dc-person" name="personName" placeholder="e.g. John Doe" required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="dc-amount">Amount ({getCurrencySymbol(currency)})</Label>
                                        <Input id="dc-amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="dc-date">Due Date</Label>
                                        <Input id="dc-date" name="dueDate" type="date" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="dc-notes">Notes</Label>
                                    <Input id="dc-notes" name="notes" placeholder="Optional context" />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                                    <Button type="submit" size="sm" disabled={createDC.isPending}>
                                        {createDC.isPending ? "Saving..." : "Save Record"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list?.map((dc) => {
                    const totalAmount = Number(dc.amount);
                    const paidAmount = Number(dc.paidAmount);
                    const remaining = totalAmount - paidAmount;
                    const progress = (paidAmount / totalAmount) * 100;
                    const isOverdue = dc.dueDate && new Date(dc.dueDate) < new Date() && dc.status !== "paid";
                    const isPaid = dc.status === "paid";

                    return (
                        <Card key={dc.id} className="group relative">
                            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-2.5">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                        activeTab === "debt" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    )}>
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-medium">{dc.personName}</CardTitle>
                                        {dc.status && dc.status !== "pending" && (
                                            <p className="text-[10px] text-muted-foreground capitalize">{dc.status.replace("_", " ")}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                                    <button
                                        onClick={() => deleteDC.mutate({ id: dc.id })}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xl font-semibold tabular-nums">
                                            {formatCurrency(remaining, currency)}
                                            <span className="text-xs text-muted-foreground font-normal ml-2">remaining</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            of {formatCurrency(totalAmount, currency)} total
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {progress.toFixed(0)}%
                                    </span>
                                </div>
                                <Progress value={progress} className={cn("h-1.5", activeTab === "debt" ? "bg-red-500/10" : "bg-emerald-500/10")} />

                                <div className="flex items-center gap-2 pt-1">
                                    {!isPaid ? (
                                        <Dialog open={payOpen === dc.id} onOpenChange={(v) => !v && setPayOpen(null)}>
                                            <DialogTrigger
                                                render={
                                                    <Button variant="outline" size="sm" className="w-full h-8 flex-1" onClick={() => setPayOpen(dc.id)}>
                                                        Record {activeTab === "debt" ? "Payment" : "Collection"}
                                                    </Button>
                                                }
                                            />
                                            <DialogContent className="sm:max-w-[300px]">
                                                <DialogHeader>
                                                    <DialogTitle className="text-sm">Settlement with {dc.personName}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-2">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Amount ({getCurrencySymbol(currency)})</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={amount}
                                                            onChange={(e) => setAmount(e.target.value)}
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <Button size="sm" className="w-full" onClick={() => handleRecord(dc.id)} disabled={recordPayment.isPending}>
                                                        {recordPayment.isPending ? "Processing..." : `Record ${activeTab === "debt" ? "Payment" : "Settlement"}`}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    ) : (
                                        <div className="w-full h-8 flex items-center justify-center gap-1.5 text-[10px] font-medium text-emerald-600 bg-emerald-500/5 border border-emerald-500/10 rounded">
                                            <CheckCircle2 className="w-3 h-3" /> Reconciled
                                        </div>
                                    )}
                                    {dc.dueDate && (
                                        <div className={cn(
                                            "text-[10px] px-2 py-1 rounded border shrink-0 flex items-center gap-1",
                                            isOverdue ? "text-red-600 bg-red-500/5 border-red-500/10" : "text-muted-foreground bg-muted/50 border-border/50"
                                        )}>
                                            <Calendar className="w-3 h-3" />
                                            {new Date(dc.dueDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {(!list || list.length === 0) && (
                    <Card className="md:col-span-2 border-dashed">
                        <CardContent className="py-16 text-center">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <HandCoins className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">No {activeTab}s recorded yet.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
