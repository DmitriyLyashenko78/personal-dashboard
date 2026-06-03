import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header/Header";
import "./globals.css";
import QueryProvider from "@/app/providers/QueryProvider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin", "cyrillic"], // Добавили кириллицу
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
    title: "Currency App",
    description: "Frankfurter API Currency Widget",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <body>
        <QueryProvider>
            <ThemeProvider>
                <Header />
                <main className="container">
                    {children}
                </main>
            </ThemeProvider>
        </QueryProvider>
        </body>
        </html>
    );
}
