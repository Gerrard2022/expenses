"use client";

import { trpc } from "@/lib/trpc.client";
import {
    PiggyBank,
    Plus,
    Target,
    Trash2,
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
import { Progress } from "@/components/ui/progress";
import { useCurrencyStore } from "@/stores/currency.store";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

export default function SavingsPage() {
    const { data: savings, refetch } = trpc.saving.getAll.useQuery();
    const [open, setOpen] = useState(false);
    const [depositOpen, setDepositOpen] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>("");
    const currency = useCurrencyStore((s) => s.currency);

    const createSaving = trpc.saving.create.useMutation({
        onSuccess: () => { refetch(); setOpen(false); },
    });

    const depositSaving = trpc.saving.deposit.useMutation({
        onSuccess: () => { refetch(); setDepositOpen(null); setAmount(""); },
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
    };

    const handleDeposit = async (id: string) => {
        if (!amount || isNaN(Number(amount))) return;
        await depositSaving.mutateAsync({ id, amount: Number(amount) });
    };

    return (
        <div className="space-y-6 py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Savings</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Set goals and watch your wealth grow.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button>
                                <Plus className="w-4 h-4 mr-1.5" />
                                New goal
                            </Button>
                        }
                    />
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add savings goal</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="goal-name">Purpose</Label>
                                <Input id="goal-name" name="name" placeholder="e.g. New Car, Emergency Fund" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="goal-target">Target ({getCurrencySymbol(currency)})</Label>
                                    <Input id="goal-target" name="targetAmount" type="number" step="0.01" placeholder="0.00" required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="goal-initial">Initial deposit</Label>
                                    <Input id="goal-initial" name="currentAmount" type="number" step="0.01" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="goal-deadline">Deadline (Optional)</Label>
                                <Input id="goal-deadline" name="deadline" type="date" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" size="sm" disabled={createSaving.isPending}>
                                    {createSaving.isPending ? "Creating..." : "Save"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savings?.map((s) => {
                    const progress = s.targetAmount ? (Number(s.currentAmount) / Number(s.targetAmount)) * 100 : 0;
                    const isCompleted = progress >= 100;

                    return (
                        <Card key={s.id} className="relative overflow-hidden group">
                            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                        <Target className="w-4 h-4" />
                                    </div>
                                    <CardTitle className="text-sm font-medium">{s.name}</CardTitle>
                                </div>
                                <button
                                    onClick={() => deleteSaving.mutate({ id: s.id })}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-2xl font-semibold tabular-nums">
                                            {formatCurrency(s.currentAmount ?? 0, currency)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            of {formatCurrency(s.targetAmount ?? 0, currency)} goal
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium ${isCompleted ? "text-emerald-600" : "text-muted-foreground"}`}>
                                        {progress.toFixed(0)}%
                                    </span>
                                </div>
                                <Progress value={Math.min(progress, 100)} className="h-1.5" />

                                <div className="flex items-center gap-2 pt-1">
                                    <Dialog open={depositOpen === s.id} onOpenChange={(v) => !v && setDepositOpen(null)}>
                                        <DialogTrigger
                                            render={
                                                <Button variant="outline" size="sm" className="w-full h-8 flex-1" onClick={() => setDepositOpen(s.id)}>
                                                    Deposit
                                                </Button>
                                            }
                                        />
                                        <DialogContent className="sm:max-w-[300px]">
                                            <DialogHeader>
                                                <DialogTitle className="text-sm">Deposit to {s.name}</DialogTitle>
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
                                                <Button size="sm" className="w-full" onClick={() => handleDeposit(s.id)} disabled={depositSaving.isPending}>
                                                    {depositSaving.isPending ? "Syncing..." : "Confirm Deposit"}
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    {s.deadline && (
                                        <div className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded border border-border/50">
                                            {new Date(s.deadline).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            {isCompleted && (
                                <div className="absolute top-2 right-12">
                                    <span className="text-[10px] font-medium bg-emerald-500 text-white px-2 py-0.5 rounded-full">Completed</span>
                                </div>
                            )}
                        </Card>
                    );
                })}

                {(!savings || savings.length === 0) && (
                    <Card className="md:col-span-2 border-dashed">
                        <CardContent className="py-16 text-center">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <PiggyBank className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">No savings goals yet.</p>
                            <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs" onClick={() => setOpen(true)}>
                                Create your first goal
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
