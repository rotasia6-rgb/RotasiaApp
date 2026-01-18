"use client";

import { useMemo, useState } from "react";
import { Delegate, ScanRecord } from "@/lib/data";
import { Search, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsPanelProps {
    delegates: Delegate[];
    records: ScanRecord[];
    selectedDay: number;
    selectedPurpose: string;
    onManualSelect: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function StatsPanel({
    delegates,
    records,
    selectedDay,
    selectedPurpose,
    onManualSelect,
    isOpen,
    onClose,
}: StatsPanelProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const recordedIds = useMemo(() => {
        return new Set(
            records
                .filter((r) => r.day === selectedDay && r.purpose === selectedPurpose)
                .map((r) => r.delegate_id)
        );
    }, [records, selectedDay, selectedPurpose]);

    const recordedCount = recordedIds.size;
    const totalCount = delegates.length;

    // Saturation Index = % of total delegates recorded
    const saturationIndex = totalCount > 0 ? (recordedCount / totalCount) * 100 : 0;

    const missingDelegates = useMemo(() => {
        return delegates.filter((d) => !recordedIds.has(d.id));
    }, [delegates, recordedIds, delegates.length]);

    const filteredMissing = useMemo(() => {
        if (!searchQuery.trim()) return missingDelegates;
        const query = searchQuery.toLowerCase();
        return missingDelegates.filter(
            (d) =>
                d.name.toLowerCase().includes(query) ||
                d.id.toLowerCase().includes(query)
        );
    }, [missingDelegates, searchQuery]);

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in"
                    onClick={onClose}
                />
            )}

            {/* Panel */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:static md:w-80 md:shadow-none md:transform-none md:border-l md:border-gray-200 flex flex-col h-full",
                    isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Live Stats</h2>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Day {selectedDay} • {selectedPurpose}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 md:hidden"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Saturation Card */}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <span className="text-5xl font-black text-gray-900 tracking-tighter">
                                    {saturationIndex.toFixed(0)}<span className="text-2xl text-gray-400">%</span>
                                </span>
                                <p className="text-xs font-bold text-gray-400 uppercase mt-1">Saturation</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{recordedCount} <span className="text-gray-400 font-normal">/ {totalCount}</span></p>
                                <p className="text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                    {recordedCount} In
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500 ease-out",
                                    saturationIndex >= 90 ? "bg-green-500" :
                                        saturationIndex >= 50 ? "bg-blue-500" : "bg-orange-400"
                                )}
                                style={{ width: `${saturationIndex}%` }}
                            />
                        </div>
                        <div className="mt-2 text-xs text-gray-500 flex justify-between">
                            <span>0%</span>
                            <span>{totalCount - recordedCount} remaining</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* Missing List */}
                    <div className="flex flex-col h-full min-h-[400px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                Missing Delegates
                                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                                    {missingDelegates.length}
                                </span>
                            </h3>
                        </div>

                        {/* Search */}
                        <div className="relative mb-4 group">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                            />
                        </div>

                        {/* List */}
                        <div className="space-y-1">
                            {filteredMissing.slice(0, 50).map((d) => (
                                <button
                                    key={d.id}
                                    onClick={() => {
                                        onManualSelect(d.id);
                                        onClose(); // Close on mobile after selection
                                    }}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 group transition-all text-left"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                            {d.id.slice(-3)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{d.name}</p>
                                            <p className="text-xs text-gray-500 font-mono">{d.id}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                </button>
                            ))}

                            {filteredMissing.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="inline-block p-4 rounded-full bg-gray-50 mb-3">
                                        <Search className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No matches found</p>
                                    <p className="text-xs text-gray-400 mt-1">Everyone accounted for?</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
