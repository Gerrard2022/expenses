"use client";

import { useCurrencyStore, CURRENCIES, CurrencyCode } from "@/stores/currency.store";

export function CurrencyPicker() {
    const { currency, setCurrency } = useCurrencyStore();

    return (
        <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
            {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                    {c.symbol} — {c.label}
                </option>
            ))}
        </select>
    );
}
