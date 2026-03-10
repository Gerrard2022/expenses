import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { SideNav } from "@/components/SideNav";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} antialiased`}>
        <Provider>
          <div className="flex bg-background min-h-screen">
            <SideNav />
            <main className="flex-1 ml-60 p-8 overflow-y-auto">
              <div className="max-w-5xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </Provider>
      </body>
    </html>
  );
}
