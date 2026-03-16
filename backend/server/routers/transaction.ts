import { z } from "zod";
import { and, eq, gte, lte, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { transactions } from "../../db/schema";
import { TRPCError } from "@trpc/server";

const txType = z.enum(["income", "expense", "saving", "credit", "debt"]);
const paymentMode = z.enum(["momo", "bank", "hand"]);

export const transactionRouter = router({

    getAll: protectedProcedure
        .input(z.object({
            type: txType.optional(),
            categoryId: z.string().optional(),
            from: z.string().datetime().optional(),
            to: z.string().datetime().optional(),
        }).optional())
        .query(async ({ ctx, input }) => {
            const conditions = [eq(transactions.userId, ctx.session.user.id)];
            if (input?.type) conditions.push(eq(transactions.type, input.type));
            if (input?.categoryId) conditions.push(eq(transactions.categoryId, input.categoryId));
            if (input?.from) conditions.push(gte(transactions.date, new Date(input.from)));
            if (input?.to) conditions.push(lte(transactions.date, new Date(input.to)));

            return db.select().from(transactions)
                .where(and(...conditions))
                .orderBy(desc(transactions.date));
        }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const [tx] = await db.select().from(transactions)
                .where(and(
                    eq(transactions.id, input.id),
                    eq(transactions.userId, ctx.session.user.id),
                ));
            if (!tx) throw new TRPCError({ code: "NOT_FOUND" });
            return tx;
        }),

    create: protectedProcedure
        .input(z.object({
            type: txType,
            name: z.string().min(1),
            amount: z.number().positive(),
            fee: z.number().min(0).optional(),
            paymentMode: paymentMode.optional(),
            date: z.string().datetime(),
            categoryId: z.string().optional(),
            notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const [tx] = await db.insert(transactions)
                .values({
                    ...input,
                    amount: String(input.amount),
                    fee: input.fee ? String(input.fee) : "0",
                    date: new Date(input.date),
                    userId: ctx.session.user.id,
                })
                .returning();
            return tx;
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            type: txType.optional(),
            name: z.string().min(1).optional(),
            amount: z.number().positive().optional(),
            fee: z.number().min(0).optional(),
            paymentMode: paymentMode.optional(),
            date: z.string().datetime().optional(),
            categoryId: z.string().optional(),
            notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, amount, fee, date, ...rest } = input;
            const [updated] = await db.update(transactions)
                .set({
                    ...rest,
                    ...(amount && { amount: String(amount) }),
                    ...(fee !== undefined && { fee: String(fee) }),
                    ...(date && { date: new Date(date) }),
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(transactions.id, id),
                    eq(transactions.userId, ctx.session.user.id),
                ))
                .returning();
            if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
            return updated;
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await db.delete(transactions)
                .where(and(
                    eq(transactions.id, input.id),
                    eq(transactions.userId, ctx.session.user.id),
                ));
            return { success: true };
        }),
});
