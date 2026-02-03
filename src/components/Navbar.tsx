"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const match = document.cookie.match(new RegExp('(^| )current_user=([^;]+)'));
            if (match) {
                setCurrentUser(match[2]);
            }
        }
    }, []);

    // Only show Navbar on dashboard pages (Organizer Pages)
    // The user requested to remove the blue header from all delegate pages.
    if (!pathname?.startsWith("/dashboard")) {
        return null;
    }

    return (
        <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/dashboard" className="text-xl font-bold tracking-tight">Rotasia Tracker</Link>
                <div className="flex gap-6">
                    {currentUser === "Kumar" && (
                        <Link href="/dashboard" className={`hover:text-blue-200 transition-colors ${pathname === '/dashboard' ? 'text-blue-200 font-semibold' : ''}`}>Dashboard</Link>
                    )}

                    <Link href="/scan" className={`hover:text-blue-200 transition-colors ${pathname === '/scan' ? 'text-blue-200 font-semibold' : ''}`}>Scanner</Link>

                    {currentUser === "Kumar" && (
                        <>
                            <Link href="/dashboard/feedback" className={`hover:text-blue-200 transition-colors ${pathname === '/dashboard/feedback' ? 'text-blue-200 font-semibold' : ''}`}>Feedback</Link>
                            <Link href="/dashboard/voting" className={`hover:text-blue-200 transition-colors ${pathname === '/dashboard/voting' ? 'text-blue-200 font-semibold' : ''}`}>Voting</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
