
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use standard font
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Rotasia Delegate Tracker",
    description: "Track delegate attendance for Rotasia event",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
                    <div className="container mx-auto flex items-center justify-between">
                        <Link href="/" className="text-xl font-bold tracking-tight">Rotasia Tracker</Link>
                        <div className="flex gap-6">
                            <Link href="/" className="hover:text-blue-200 transition-colors">Dashboard</Link>
                            <Link href="/scan" className="hover:text-blue-200 transition-colors">Scannner</Link>
                        </div>
                    </div>
                </nav>
                <main className="min-h-[calc(100vh-64px)] bg-gray-50">
                    {children}
                </main>
            </body>
        </html>
    );
}
