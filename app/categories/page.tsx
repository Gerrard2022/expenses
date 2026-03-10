"use client";

import { trpc } from "@/lib/trpc.client";
import { Plus, Trash2, Tag } from "lucide-react";
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

const COLORS = ["#64748b", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#22c55e"];

export default function CategoriesPage() {
    const { data: categories, refetch } = trpc.category.getAll.useQuery();
    const { data: transactions } = trpc.transaction.getAll.useQuery();
    const [open, setOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    const createCategory = trpc.category.create.useMutation({
        onSuccess: () => { refetch(); setOpen(false); setSelectedColor(COLORS[0]); },
    });

    const deleteCategory = trpc.category.delete.useMutation({
        onSuccess: () => refetch(),
    });

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await createCategory.mutateAsync({
            name: formData.get("name") as string,
            color: selectedColor,
            icon: "tag",
        });
    };

    const getStats = (id: string) => {
        const txs = transactions?.filter(t => t.categoryId === id) || [];
        return { total: txs.reduce((acc, t) => acc + Number(t.amount), 0), count: txs.length };
    };

    return (
        <div className="space-y-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Categories</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Organise your transactions by category.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        render={
                            <Button>
                                <Plus className="w-4 h-4 mr-1.5" />
                                New category
                            </Button>
                        }
                    />
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Add category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="cat-name">Name</Label>
                                <Input id="cat-name" name="name" placeholder="e.g. Groceries, Rent" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Color</Label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {COLORS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setSelectedColor(c)}
                                            className={`w-7 h-7 rounded-full transition-all ${selectedColor === c ? "ring-2 ring-offset-2 ring-ring scale-110" : "opacity-60 hover:opacity-100"}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" size="sm" disabled={createCategory.isPending}>
                                    {createCategory.isPending ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Grid */}
            {categories && categories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories.map((c) => {
                        const stats = getStats(c.id);
                        return (
                            <Card key={c.id} className="group">
                                <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="w-7 h-7 rounded-md flex items-center justify-center"
                                            style={{ backgroundColor: `${c.color}20`, color: c.color || "#64748b" }}
                                        >
                                            <Tag className="w-4 h-4" />
                                        </div>
                                        <CardTitle className="text-sm font-medium">{c.name}</CardTitle>
                                    </div>
                                    <button
                                        onClick={() => deleteCategory.mutate({ id: c.id })}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{stats.count} transactions</span>
                                        <span className="font-medium tabular-nums">{stats.total.toLocaleString()}</span>
                                    </div>
                                    <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                backgroundColor: c.color || "#64748b",
                                                width: stats.count > 0 ? `${Math.min((stats.count / (categories.length * 2)) * 100, 100)}%` : "0%"
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-16 text-center">
                        <p className="text-sm text-muted-foreground">No categories yet.</p>
                        <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs" onClick={() => setOpen(true)}>
                            Create your first category
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
