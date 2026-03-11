import { create } from "zustand";
import { persist } from "zustand/middleware";

export const CURRENCIES = [
    { code: "RWF", symbol: "Fr", label: "Rwandan Franc" },
    { code: "USD", symbol: "$", label: "US Dollar" },
    { code: "EUR", symbol: "€", label: "Euro" },
    { code: "GBP", symbol: "£", label: "British Pound" },
    { code: "KES", symbol: "Ksh", label: "Kenyan Shilling" },
    { code: "NGN", symbol: "₦", label: "Nigerian Naira" },
    { code: "UGX", symbol: "Ush", label: "Ugandan Shilling" },
    { code: "TZS", symbol: "Tsh", label: "Tanzanian Shilling" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

type CurrencyStore = {
    currency: CurrencyCode;
    setCurrency: (currency: CurrencyCode) => void;
};

export const useCurrencyStore = create<CurrencyStore>()(
    persist(
        (set) => ({
            currency: "RWF",                              // default
            setCurrency: (currency) => set({ currency }),
        }),
        { name: "currency-preference" }                 // localStorage key
    )
);
