"use client";

import { useMemo, useState, useEffect } from "react";
import { useScanRecords } from "@/hooks/useScanRecords";
import { calculateStats } from "@/lib/stats";
import { Users, UserCheck, Activity, Filter, ChevronDown, LogOut, Crown, MessageSquareQuote, FileText } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { DAYS, PURPOSES_BY_DAY, Day } from "@/lib/data";
import { PERMISSIONS } from "@/lib/permissions";

import { useDelegates } from "@/hooks/useDelegates";
import DelegatesModal from "@/components/DelegatesModal";
import BreakdownModal from "@/components/BreakdownModal";

export default function Dashboard() {
    const records = useScanRecords();
    const { delegates, isLoading } = useDelegates();
    const [isDelegatesModalOpen, setIsDelegatesModalOpen] = useState(false);

    // Filter State
    const [filterDay, setFilterDay] = useState<Day>(DAYS[0]);
    const [filterPurpose, setFilterPurpose] = useState<string>(PURPOSES_BY_DAY[DAYS[0]][0]);
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [activeBreakdown, setActiveBreakdown] = useState<{ day: Day; purpose: string } | null>(null);

    // Get current user from cookie
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const match = document.cookie.match(new RegExp('(^| )current_user=([^;]+)'));
            if (match) {
                setCurrentUser(match[2]);
            }
        }
    }, []);

    const availableDays = useMemo(() => {
        if (!currentUser || !PERMISSIONS[currentUser]) return DAYS;
        if (PERMISSIONS[currentUser].allowedPurposes.includes("ALL")) return DAYS;
        return PERMISSIONS[currentUser].allowedDays;
    }, [currentUser]);

    const availablePurposes = useMemo(() => {
        if (!currentUser) return [];
        const dayPurposes = PURPOSES_BY_DAY[filterDay];
        if (!PERMISSIONS[currentUser]) return dayPurposes;

        if (PERMISSIONS[currentUser].allowedPurposes.includes("ALL")) return dayPurposes;

        return dayPurposes.filter(p => PERMISSIONS[currentUser].allowedPurposes.includes(p));
    }, [currentUser, filterDay]);

    // Ensure selectedDay is valid
    useMemo(() => {
        if (availableDays.length > 0 && !availableDays.includes(filterDay)) {
            setFilterDay(availableDays[0]);
        }
    }, [availableDays, filterDay]);

    // Ensure selectedPurpose is valid
    useMemo(() => {
        if (availablePurposes.length > 0) {
            if (!filterPurpose || !availablePurposes.includes(filterPurpose)) {
                setFilterPurpose(availablePurposes[0]);
            }
        }
    }, [availablePurposes, filterPurpose]);

    // Calculate stats only when delegates are loaded
    const stats = useMemo(() => {
        if (isLoading) return null;
        return calculateStats(records, delegates);
    }, [records, delegates, isLoading]);

    const filteredData = useMemo(() => {
        if (!records) return { count: 0, remaining: 0 };
        // We can just filter raw records directly for absolute accuracy
        const count = records.filter(r => r.day === filterDay && r.purpose === filterPurpose).length;
        const total = delegates.length;
        return {
            count,
            remaining: total - count
        };
    }, [records, delegates.length, filterDay, filterPurpose]);

    const handleDayChange = (newDay: Day) => {
        setFilterDay(newDay);
        // Default to first purpose of new day to avoid invalid state
        // This will be auto-corrected by the useEffect above, but good to reset here too
        // setFilterPurpose(PURPOSES_BY_DAY[newDay][0]); // Removed to let effect handle it safely
    };

    if (isLoading || !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Simple heuristic: If breakfast is 50%, predict lunch will be ~95% of breakfast + 5% variance
    const currentDay = 2; // Hardcoded for demo
    const breakfastCount = records.filter(r => r.day === currentDay && r.purpose === "Breakfast").length;
    const lunchPrediction = Math.round(breakfastCount * 0.98);

    // Filter relevant days/purposes for stats display
    const visibleStats = stats.dailyStats.filter(day => availableDays.includes(day.day)).map(day => ({
        ...day,
        purposes: day.purposes.filter(p => {
            if (!currentUser || !PERMISSIONS[currentUser]) return true;
            if (PERMISSIONS[currentUser].allowedPurposes.includes("ALL")) return true;
            return PERMISSIONS[currentUser].allowedPurposes.includes(p.name);
        })
    }));

    // Bottleneck Logic (Filtered)
    const bottleneckPurpose = visibleStats
        .flatMap(day => day.purposes.map(p => ({ ...p, day: day.day })))
        .find(p => p.percentage < 20 && p.percentage > 0);

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Event Dashboard</h1>
                <form action={logoutAction}>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </form>
            </div>

            {/* KPI Cards */}
            <div className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-6 mb-10",
                currentUser === "Kumar" ? "lg:grid-cols-4" : "lg:grid-cols-3"
            )}>
                <KpiCard
                    title="Total Delegates"
                    value={stats.totalDelegates}
                    icon={<Users className="w-6 h-6 text-blue-500" />}
                    subtext="Registered Attendees"
                    onClick={() => setIsDelegatesModalOpen(true)}
                    className="cursor-pointer hover:border-blue-300 hover:shadow-md transition-all active:scale-95"
                />

                {/* Filterable Scan Stats Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-visible z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                <Filter className="w-4 h-4" /> Scan Checker
                            </p>

                            <div className="flex gap-2 mt-3">
                                {/* Day Selector */}
                                <div className="relative">
                                    <select
                                        value={filterDay}
                                        onChange={(e) => handleDayChange(Number(e.target.value) as Day)}
                                        className="appearance-none bg-blue-50 border-none text-blue-700 text-sm font-bold rounded-lg py-1.5 pl-3 pr-8 cursor-pointer hover:bg-blue-100 transition-colors focus:ring-2 focus:ring-blue-200 outline-none"
                                    >
                                        {availableDays.map(d => <option key={d} value={d}>Day {d}</option>)}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-blue-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                {/* Purpose Selector */}
                                <div className="relative">
                                    <select
                                        value={filterPurpose}
                                        onChange={(e) => setFilterPurpose(e.target.value)}
                                        className="appearance-none bg-gray-50 border-none text-gray-700 text-sm font-bold rounded-lg py-1.5 pl-3 pr-8 cursor-pointer hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-gray-200 outline-none max-w-[140px] truncate"
                                    >
                                        {availablePurposes.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                        <div>
                            <div className="text-3xl font-bold text-gray-900">{filteredData.count}</div>
                            <div className="text-xs text-gray-400 font-medium uppercase mt-1">Scanned</div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-400">{filteredData.remaining}</div>
                            <div className="text-xs text-gray-400 font-medium uppercase mt-1">Remaining</div>
                        </div>
                    </div>
                </div>

                {/* Catering (Visible only for Food or Admin) */}
                {(!currentUser || !PERMISSIONS[currentUser] || PERMISSIONS[currentUser].allowedPurposes.includes("ALL") || currentUser === "Food") && (
                    <KpiCard
                        title="Catering Forecast"
                        value={`~${lunchPrediction}`}
                        icon={<UserCheck className="w-6 h-6 text-orange-500" />}
                        subtext={`Lunch prediction based on ${breakfastCount} Breakfast`}
                    />
                )}

                {/* Modules for Kumar Only */}
                {currentUser === "Kumar" && (
                    <>
                        <KpiCard
                            title="Feedback"
                            value="Manage"
                            icon={<MessageSquareQuote className="w-6 h-6 text-purple-500" />}
                            subtext="View & Approve Feedback"
                            onClick={() => window.location.href = '/dashboard/feedback'}
                            className="cursor-pointer hover:border-purple-300 hover:shadow-lg transition-all active:scale-95"
                        />

                        <KpiCard
                            title="Best Outfit"
                            value="Voting"
                            icon={<Crown className="w-6 h-6 text-yellow-500" />}
                            subtext="Manage Contestants"
                            onClick={() => window.location.href = '/dashboard/voting'}
                            className="cursor-pointer hover:border-yellow-300 hover:shadow-lg transition-all active:scale-95"
                        />

                        <KpiCard
                            title="Registrations"
                            value="View"
                            icon={<FileText className="w-6 h-6 text-green-500" />}
                            subtext="Event Showcase Entries"
                            onClick={() => window.location.href = '/dashboard/registrations'}
                            className="cursor-pointer hover:border-green-300 hover:shadow-lg transition-all active:scale-95"
                        />
                    </>
                )}
            </div>

            {/* Bottleneck Alert */}
            {bottleneckPurpose && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-red-900">Potential Bottleneck: {bottleneckPurpose.name} (Day {bottleneckPurpose.day})</h3>
                        <p className="text-sm text-red-700 mt-1">
                            Only {bottleneckPurpose.count} scans recorded ({bottleneckPurpose.percentage.toFixed(1)}%).
                            This is significantly lower than expected. Check scanner stations.
                        </p>
                    </div>
                </div>
            )}

            {/* Daily Breakdown */}
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Daily Breakdown</h2>
            <div className="grid grid-cols-1 gap-8">
                {visibleStats.map((dayStat) => (
                    <div key={dayStat.day} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Day {dayStat.day}</h3>
                                <p className="text-sm text-gray-500">All Purposes Completion: <span className="font-semibold text-gray-800">{dayStat.completionRate.toFixed(1)}%</span></p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {dayStat.purposes.map((purpose) => (
                                <div
                                    key={purpose.name}
                                    className="cursor-pointer group"
                                    onClick={() => setActiveBreakdown({ day: dayStat.day, purpose: purpose.name })}
                                >
                                    <div className="flex justify-between text-sm mb-1 group-hover:bg-gray-50 p-1 rounded transition-colors -mx-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{purpose.name}</span>
                                            {purpose.percentage > 80 && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Completed</span>}
                                        </div>
                                        <span className="text-gray-500 group-hover:text-gray-900 transition-colors">{purpose.count} / {stats.totalDelegates} ({purpose.percentage.toFixed(0)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-2.5 rounded-full transition-all duration-500",
                                                purpose.percentage >= 100 ? "bg-green-500" :
                                                    purpose.percentage > 50 ? "bg-blue-500" : "bg-blue-300"
                                            )}
                                            style={{ width: `${purpose.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Delegates Modal */}
            <DelegatesModal
                isOpen={isDelegatesModalOpen}
                onClose={() => setIsDelegatesModalOpen(false)}
                delegates={delegates}
            />

            {/* Breakdown Modal */}
            {activeBreakdown && (
                <BreakdownModal
                    isOpen={!!activeBreakdown}
                    onClose={() => setActiveBreakdown(null)}
                    delegates={delegates}
                    records={records}
                    day={activeBreakdown.day}
                    purpose={activeBreakdown.purpose}
                />
            )}
        </div>
    );
}

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subtext: string;
    onClick?: () => void;
    className?: string;
}

function KpiCard({ title, value, icon, subtext, onClick, className }: KpiCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between select-none",
                className
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
            </div>
            <p className="text-sm text-gray-400">{subtext}</p>
        </div>
    );
}
