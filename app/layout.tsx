import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { SideNav } from "@/components/SideNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ExpensWise — Smart Expense Tracker",
  description: "Track your expenses, savings, and debts with ease and style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased selection:bg-green-500/20 selection:text-green-500`}>
        <Provider>
          <div className="flex bg-background min-h-screen">
            <SideNav />
            <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto">
              <div className="max-w-6xl mx-auto space-y-12">
                {children}
              </div>
            </main>
          </div>
        </Provider>
      </body>
    </html>
  );
}
