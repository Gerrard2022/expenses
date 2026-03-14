import type { Metadata } from "next";
import "./globals.css";
import Provider from "./provider";
import { AppShell } from "@/components/AppShell";

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
    <html lang="en" className="dark">
      <body className="antialiased font-sans">
        <Provider>
          <AppShell>
            {children}
          </AppShell>
        </Provider>
      </body>
    </html>
  );
}
