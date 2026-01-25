"use client";

import { useState, useMemo } from "react";
import { Delegate, ScanRecord, Day } from "@/lib/data";
import { Search, X, Users, Filter, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreakdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    delegates: Delegate[];
    records: ScanRecord[] | null;
    day: Day;
    purpose: string;
}

type Tab = "remaining" | "scanned";

export default function BreakdownModal({ isOpen, onClose, delegates, records, day, purpose }: BreakdownModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>("remaining");

    // Memoize the classification of delegates to avoid re-calculating on every search keystroke
    const { startList, remainingCount, scannedCount } = useMemo(() => {
        if (!records) return { startList: [], remainingCount: 0, scannedCount: 0 };

        const scannedIds = new Set(
            records
                .filter(r => r.day === day && r.purpose === purpose)
                .map(r => r.delegate_id)
        );

        const remaining = [];
        const scanned = [];

        for (const delegate of delegates) {
            if (scannedIds.has(delegate.id)) {
                // Find timestamp for scanned
                const record = records.find(r => r.delegate_id === delegate.id && r.day === day && r.purpose === purpose);
                scanned.push({ ...delegate, scannedAt: record?.timestamp });
            } else {
                remaining.push(delegate);
            }
        }

        return {
            startList: activeTab === "remaining" ? remaining : scanned,
            remainingCount: remaining.length,
            scannedCount: scanned.length
        };
    }, [delegates, records, day, purpose, activeTab]);

    const filteredList = useMemo(() => {
        if (!searchQuery.trim()) return startList;
        const query = searchQuery.toLowerCase();
        return startList.filter(
            (d) =>
                d.name.toLowerCase().includes(query) ||
                d.id.toLowerCase().includes(query) ||
                (d.organization && d.organization.toLowerCase().includes(query))
        );
    }, [startList, searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex flex-col gap-4 bg-white sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Filter className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{purpose} - Day {day}</h2>
                                <p className="text-sm text-gray-500">
                                    Breakdown Details
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-100 rounded-lg w-full max-w-md">
                        <button
                            onClick={() => setActiveTab("remaining")}
                            className={cn(
                                "flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                                activeTab === "remaining"
                                    ? "bg-white text-red-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <XCircle className="w-4 h-4" />
                            Remaining ({remainingCount})
                        </button>
                        <button
                            onClick={() => setActiveTab("scanned")}
                            className={cn(
                                "flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                                activeTab === "scanned"
                                    ? "bg-white text-green-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <CheckCircle className="w-4 h-4" />
                            Scanned ({scannedCount})
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-lg mx-auto md:mx-0">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, Name, or Organization..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            autoFocus
                        />
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 shadow-sm z-10">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">ID</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Organization</th>
                                {activeTab === "scanned" && <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredList.map((delegate: any) => (
                                <tr key={delegate.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={cn(
                                            "font-mono font-medium px-2 py-1 rounded text-sm border transition-colors",
                                            activeTab === "remaining"
                                                ? "bg-red-50 text-red-700 border-red-100"
                                                : "bg-green-50 text-green-700 border-green-100"
                                        )}>
                                            {delegate.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">{delegate.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                        <div className="text-sm text-gray-500">{delegate.organization || "N/A"}</div>
                                    </td>
                                    {activeTab === "scanned" && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {delegate.scannedAt ? new Date(delegate.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {filteredList.length === 0 && (
                                <tr>
                                    <td colSpan={activeTab === "scanned" ? 4 : 3} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Search className="w-8 h-8 text-gray-300" />
                                            <p>No delegates found matching "{searchQuery}"</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
