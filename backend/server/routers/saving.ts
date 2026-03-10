import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { savings } from "../../db/schema";
import { TRPCError } from "@trpc/server";

export const savingRouter = router({

    getAll: protectedProcedure
        .query(async ({ ctx }) => {
            return db.select().from(savings)
                .where(eq(savings.userId, ctx.session.user.id));
        }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const [s] = await db.select().from(savings)
                .where(and(
                    eq(savings.id, input.id),
                    eq(savings.userId, ctx.session.user.id),
                ));
            if (!s) throw new TRPCError({ code: "NOT_FOUND" });
            return s;
        }),

    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            targetAmount: z.number().positive().optional(),
            currentAmount: z.number().min(0).optional(),
            deadline: z.string().datetime().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const [s] = await db.insert(savings)
                .values({
                    ...input,
                    targetAmount: input.targetAmount ? String(input.targetAmount) : undefined,
                    currentAmount: input.currentAmount ? String(input.currentAmount) : undefined,
                    deadline: input.deadline ? new Date(input.deadline) : undefined,
                    userId: ctx.session.user.id,
                })
                .returning();
            return s;
        }),

    deposit: protectedProcedure
        .input(z.object({
            id: z.string(),
            amount: z.number().positive(),
        }))
        .mutation(async ({ ctx, input }) => {
            const [s] = await db.select().from(savings)
                .where(and(
                    eq(savings.id, input.id),
                    eq(savings.userId, ctx.session.user.id),
                ));
            if (!s) throw new TRPCError({ code: "NOT_FOUND" });

            const newAmount = Number(s.currentAmount) + input.amount;
            const isCompleted = s.targetAmount ? newAmount >= Number(s.targetAmount) : false;

            const [updated] = await db.update(savings)
                .set({ currentAmount: String(newAmount), isCompleted, updatedAt: new Date() })
                .where(eq(savings.id, input.id))
                .returning();
            return updated;
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            targetAmount: z.number().positive().optional(),
            deadline: z.string().datetime().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, targetAmount, deadline, ...rest } = input;
            const [updated] = await db.update(savings)
                .set({
                    ...rest,
                    ...(targetAmount && { targetAmount: String(targetAmount) }),
                    ...(deadline && { deadline: new Date(deadline) }),
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(savings.id, id),
                    eq(savings.userId, ctx.session.user.id),
                ))
                .returning();
            if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
            return updated;
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await db.delete(savings)
                .where(and(
                    eq(savings.id, input.id),
                    eq(savings.userId, ctx.session.user.id),
                ));
            return { success: true };
        }),
});
