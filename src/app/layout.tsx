
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use standard font
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Rotasia Delegate Tracker",
    description: "Track delegate attendance for Rotasia event",
};

import Navbar from "@/components/Navbar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Navbar />
                <main className="min-h-[calc(100vh-64px)] bg-gray-50">
                    {children}
                </main>
            </body>
        </html>
    );
}
