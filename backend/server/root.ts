import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { categoryRouter } from "./routers/category";
import { transactionRouter } from "./routers/transaction";
import { savingRouter } from "./routers/saving";
import { debtCreditRouter } from "./routers/debtCredit";

export const appRouter = router({
    user: userRouter,
    category: categoryRouter,
    transaction: transactionRouter,
    saving: savingRouter,
    debtCredit: debtCreditRouter,
});

export type AppRouter = typeof appRouter;
