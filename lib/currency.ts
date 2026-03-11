import { CURRENCIES, CurrencyCode } from "@/stores/currency.store";

// ─── Exchange rates relative to RWF (1 RWF = X target) ───
// Update these periodically or wire up to an API
const RATES_FROM_RWF: Record<CurrencyCode, number> = {
    RWF: 1,
    USD: 0.00073,   // ~1,370 RWF per 1 USD
    EUR: 0.00067,   // ~1,490 RWF per 1 EUR
    GBP: 0.00057,   // ~1,750 RWF per 1 GBP
    KES: 0.094,     // ~10.6 RWF per 1 KES
    NGN: 1.13,      // ~0.88 RWF per 1 NGN
    UGX: 2.73,      // ~0.37 RWF per 1 UGX
    TZS: 1.93,      // ~0.52 RWF per 1 TZS
};

/**
 * Format an amount in the given currency using Intl.NumberFormat.
 * Always treats the amount as already being in the target currency.
 */
export function formatCurrency(
    amount: number | string,
    code: CurrencyCode
): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
        minimumFractionDigits: code === "RWF" || code === "UGX" || code === "TZS" ? 0 : 2,
        maximumFractionDigits: code === "RWF" || code === "UGX" || code === "TZS" ? 0 : 2,
    }).format(Number(amount));
}

/**
 * Get the symbol string for a given currency code.
 */
export function getCurrencySymbol(code: CurrencyCode): string {
    return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

/**
 * Convert an amount **from RWF** to the target currency.
 */
export function convertFromRWF(
    rwfAmount: number,
    targetCode: CurrencyCode
): number {
    return rwfAmount * (RATES_FROM_RWF[targetCode] ?? 1);
}

/**
 * Convert an amount from the source currency **to RWF**.
 */
export function convertToRWF(
    amount: number,
    sourceCode: CurrencyCode
): number {
    const rate = RATES_FROM_RWF[sourceCode];
    if (!rate || rate === 0) return amount;
    return amount / rate;
}

/**
 * Format an RWF amount in a different currency (for display).
 * Returns a string like "≈ $3.65".
 */
export function formatConvertedFromRWF(
    rwfAmount: number,
    targetCode: CurrencyCode
): string {
    if (targetCode === "RWF") return formatCurrency(rwfAmount, "RWF");
    const converted = convertFromRWF(rwfAmount, targetCode);
    return `≈ ${formatCurrency(converted, targetCode)}`;
}
