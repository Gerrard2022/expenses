import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { AppShell } from "@/components/AppShell";
import { TooltipProvider } from "@/components/ui/tooltip";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "ExpensWise",
  description: "Track your expenses, savings, and debts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${montserrat.variable}`}>
      <body className={`${montserrat.className} antialiased`}>
        <Provider>
          <AppShell>
            <TooltipProvider>{children}</TooltipProvider>
          </AppShell>
        </Provider>
      </body>
    </html>
  );
}
