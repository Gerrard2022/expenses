import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { debtsCredits } from "../../db/schema";
import { TRPCError } from "@trpc/server";

const dcType = z.enum(["debt", "credit"]);
const dcStatus = z.enum(["pending", "partially_paid", "paid"]);
const paymentMode = z.enum(["momo", "bank", "hand"]);

export const debtCreditRouter = router({

    getAll: protectedProcedure
        .input(z.object({ type: dcType.optional() }).optional())
        .query(async ({ ctx, input }) => {
            const conditions = [eq(debtsCredits.userId, ctx.session.user.id)];
            if (input?.type) conditions.push(eq(debtsCredits.type, input.type));
            return db.select().from(debtsCredits).where(and(...conditions));
        }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const [dc] = await db.select().from(debtsCredits)
                .where(and(
                    eq(debtsCredits.id, input.id),
                    eq(debtsCredits.userId, ctx.session.user.id),
                ));
            if (!dc) throw new TRPCError({ code: "NOT_FOUND" });
            return dc;
        }),

    create: protectedProcedure
        .input(z.object({
            type: dcType,
            personName: z.string().min(1),
            amount: z.number().positive(),
            fee: z.number().min(0).optional(),
            paymentMode: paymentMode.optional(),
            dueDate: z.string().datetime().optional(),
            notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const [dc] = await db.insert(debtsCredits)
                .values({
                    ...input,
                    amount: String(input.amount),
                    fee: input.fee ? String(input.fee) : "0",
                    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
                    userId: ctx.session.user.id,
                })
                .returning();
            return dc;
        }),

    recordPayment: protectedProcedure
        .input(z.object({
            id: z.string(),
            amount: z.number().positive(),
        }))
        .mutation(async ({ ctx, input }) => {
            const [dc] = await db.select().from(debtsCredits)
                .where(and(
                    eq(debtsCredits.id, input.id),
                    eq(debtsCredits.userId, ctx.session.user.id),
                ));
            if (!dc) throw new TRPCError({ code: "NOT_FOUND" });

            const newPaid = Number(dc.paidAmount) + input.amount;
            const total = Number(dc.amount);
            const status = newPaid >= total ? "paid"
                : newPaid > 0 ? "partially_paid"
                    : "pending";

            const [updated] = await db.update(debtsCredits)
                .set({ paidAmount: String(newPaid), status, updatedAt: new Date() })
                .where(eq(debtsCredits.id, input.id))
                .returning();
            return updated;
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            personName: z.string().min(1).optional(),
            amount: z.number().positive().optional(),
            fee: z.number().min(0).optional(),
            paymentMode: paymentMode.optional(),
            status: dcStatus.optional(),
            dueDate: z.string().datetime().optional(),
            notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, amount, fee, dueDate, ...rest } = input;
            
            // Recalculate status if amount changes
            const [current] = await db.select().from(debtsCredits)
                .where(and(
                    eq(debtsCredits.id, id),
                    eq(debtsCredits.userId, ctx.session.user.id),
                ));
            
            if (!current) throw new TRPCError({ code: "NOT_FOUND" });

            let status = rest.status;
            if (amount !== undefined && status === undefined) {
                const paid = Number(current.paidAmount);
                status = paid >= amount ? "paid"
                    : paid > 0 ? "partially_paid"
                    : "pending";
            }

            const [updated] = await db.update(debtsCredits)
                .set({
                    ...rest,
                    ...(status && { status }),
                    ...(amount && { amount: String(amount) }),
                    ...(fee !== undefined && { fee: String(fee) }),
                    ...(dueDate && { dueDate: new Date(dueDate) }),
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(debtsCredits.id, id),
                    eq(debtsCredits.userId, ctx.session.user.id),
                ))
                .returning();
            return updated;
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await db.delete(debtsCredits)
                .where(and(
                    eq(debtsCredits.id, input.id),
                    eq(debtsCredits.userId, ctx.session.user.id),
                ));
            return { success: true };
        }),
});
