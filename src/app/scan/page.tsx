"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { DAYS, PURPOSES_BY_DAY, Day } from "@/lib/data";
import { PERMISSIONS } from "@/lib/permissions";
import { supabase } from "@/lib/supabase";
import { useScanRecords } from "@/hooks/useScanRecords";
import { useDelegates } from "@/hooks/useDelegates"; // New hook
import { useOfflineSync } from "@/hooks/useOfflineSync"; // New hook
import QRScanner from "@/components/scanner/QRScanner";
import StatsPanel from "@/components/StatsPanel"; // New component
import { CheckCircle, AlertTriangle, AlertCircle, CloudOff, Menu, ArrowLeft, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link"; // For back button

// Simple beep sound data URI
const BEEP_SOUND = "data:audio/wav;base64,UklGRl9vTNEAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"; // Placeholder, real implementation would use a better asset or AudioContext

export default function ScanPage() {
    const [selectedDay, setSelectedDay] = useState<Day>(1);
    const [selectedPurpose, setSelectedPurpose] = useState<string>("");
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [manualId, setManualId] = useState("");
    const [feedback, setFeedback] = useState<{ type: "success" | "warning" | "error"; message: string; subtext?: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false); // Mobile Drawer State

    // Audio context ref
    const audioContextRef = useRef<AudioContext | null>(null);

    const records = useScanRecords();
    const { delegates, isLoading: isLoadingDelegates } = useDelegates();
    const { addToQueue, queueLength, isSyncing } = useOfflineSync();

    // Get current user from cookie
    useEffect(() => {
        const match = document.cookie.match(new RegExp('(^| )current_user=([^;]+)'));
        if (match) {
            setCurrentUser(match[2]);
        }
    }, []);

    // Filtered Days based on permissions
    const availableDays = useMemo(() => {
        if (!currentUser || !PERMISSIONS[currentUser]) return DAYS;
        if (PERMISSIONS[currentUser].allowedPurposes.includes("ALL")) return DAYS;
        return PERMISSIONS[currentUser].allowedDays;
    }, [currentUser]);

    // Filtered Purposes based on permissions
    const availablePurposes = useMemo(() => {
        if (!currentUser) return [];
        const dayPurposes = PURPOSES_BY_DAY[selectedDay];
        if (!PERMISSIONS[currentUser]) return dayPurposes;

        if (PERMISSIONS[currentUser].allowedPurposes.includes("ALL")) return dayPurposes;

        return dayPurposes.filter(p => PERMISSIONS[currentUser].allowedPurposes.includes(p));
    }, [currentUser, selectedDay]);

    // Ensure selectedDay is valid
    useEffect(() => {
        if (availableDays.length > 0 && !availableDays.includes(selectedDay)) {
            setSelectedDay(availableDays[0]);
        }
    }, [availableDays, selectedDay]);

    // Ensure selectedPurpose is valid
    useEffect(() => {
        if (availablePurposes.length > 0) {
            if (!selectedPurpose || !availablePurposes.includes(selectedPurpose)) {
                setSelectedPurpose(availablePurposes[0]);
            }
        }
    }, [availablePurposes, selectedPurpose]);

    // Initialize Audio Context
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }, []);

    const playBeep = (type: "success" | "error") => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "success") {
            osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch for success
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        } else {
            osc.frequency.setValueAtTime(150, ctx.currentTime); // Low pitch for error
            osc.type = "sawtooth";
        }

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    };

    const handleScan = async (id: string) => {
        // Normalize ID
        const cleanId = id.trim().toUpperCase();

        // 1. Check-Verify-Commit: processing lock
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            // 2. Local Validation (Instant Fail)
            const delegate = delegates.find((d) => d.id === cleanId);
            if (!delegate) {
                playBeep("error");
                setFeedback({ type: "error", message: "Invalid ID", subtext: `${cleanId} not found` });
                setIsProcessing(false);
                return;
            }

            // 3. Duplicate Check (Local Cache First - Latency Optimization)
            const alreadyScannedLocal = records.find(
                r => r.delegate_id === cleanId && r.day === selectedDay && r.purpose === selectedPurpose
            );

            if (alreadyScannedLocal) {
                playBeep("error"); // Warning beep
                setFeedback({
                    type: "warning",
                    message: "Duplicate Entry!",
                    subtext: `Already recorded at ${new Date(alreadyScannedLocal.timestamp).toLocaleTimeString()}`
                });
                setIsProcessing(false);
                return;
            }

            // 4. Commit to DB or Queue
            if (!navigator.onLine) {
                // Offline Mode
                addToQueue({
                    delegate_id: delegate.id,
                    day: selectedDay,
                    purpose: selectedPurpose,
                    timestamp: new Date().toISOString()
                });
                playBeep("success");
                setFeedback({ type: "warning", message: "Saved Offline", subtext: "Will sync when online" });
            } else {
                // Online Mode
                const { error } = await supabase.from("scans").insert({
                    delegate_id: delegate.id,
                    day: selectedDay,
                    purpose: selectedPurpose,
                    timestamp: new Date().toISOString()
                });

                if (error) {
                    if (error.code === '23505') { // Unique constraint
                        playBeep("error");
                        setFeedback({ type: "warning", message: "Duplicate Entry!", subtext: "Recorded by another device." });
                    } else if (error.message && (error.message.includes("fetch") || error.message.includes("network"))) {
                        // Network error fallback
                        addToQueue({
                            delegate_id: delegate.id,
                            day: selectedDay,
                            purpose: selectedPurpose,
                            timestamp: new Date().toISOString()
                        });
                        playBeep("success");
                        setFeedback({ type: "warning", message: "Saved Offline", subtext: "Network error, queued." });
                    } else {
                        console.error("Insert error:", error);
                        setFeedback({ type: "error", message: "System Error", subtext: "Could not save scan." });
                    }
                } else {
                    playBeep("success");
                    setFeedback({ type: "success", message: delegate.name, subtext: "Recorded successfully" });
                }
            }

        } catch (err) {
            console.error(err);
            // Catch-all for network throws if supabase client throws instead of returning error
            setFeedback({ type: "error", message: "Unexpected Error", subtext: "Try again" });
        } finally {
            // 5. Auto-Reset (<1s)
            setManualId("");
            setIsProcessing(false);

            const delay = 1500;
            setTimeout(() => setFeedback(null), delay);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualId.trim()) handleScan(manualId);
    };

    if (isLoadingDelegates) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading delegates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black/95 flex flex-col md:flex-row h-screen overflow-hidden">
            {/* Main Scanning Area */}
            <div className="flex-1 flex flex-col relative">

                {/* Header (Transparent on Mobile) */}
                <header className="flex items-center justify-between p-4 z-10 sticky top-0 bg-gradient-to-b from-black/80 to-transparent">
                    <Link href="/" className="text-white/80 hover:text-white flex items-center gap-2 transition-colors">
                        <div className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                    </Link>

                    {/* Offline Indicator - Header */}
                    {queueLength > 0 && (
                        <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-full backdrop-blur-md">
                            <CloudOff className="w-4 h-4" />
                            <span className="text-xs font-bold">{queueLength} Offline</span>
                        </div>
                    )}

                    <button
                        onClick={() => setIsStatsOpen(true)}
                        className="text-white/80 hover:text-white flex items-center gap-2 transition-colors md:hidden"
                    >
                        <div className="p-2 bg-white/10 rounded-full backdrop-blur-md relative">
                            <BarChart2 className="w-5 h-5" />
                            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
                        </div>
                    </button>
                    {/* Desktop spacer */}
                    <div className="hidden md:block w-9"></div>
                </header>

                {/* Content Container */}
                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto p-4 gap-4 relative">

                    {/* Floating Toast Feedback */}
                    <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pointer-events-none p-4">
                        {feedback && (
                            <div className={cn(
                                "flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 w-full max-w-sm pointer-events-auto border",
                                feedback.type === "success" ? "bg-green-500/20 border-green-500/30 text-green-100" :
                                    feedback.type === "warning" ? "bg-orange-500/20 border-orange-500/30 text-orange-100" :
                                        "bg-red-500/20 border-red-500/30 text-red-100"
                            )}>
                                <div className={cn(
                                    "p-2 rounded-full flex-shrink-0",
                                    feedback.type === "success" ? "bg-green-500 text-white" :
                                        feedback.type === "warning" ? "bg-orange-500 text-white" : "bg-red-500 text-white"
                                )}>
                                    {feedback.type === "success" && <CheckCircle className="w-5 h-5" />}
                                    {feedback.type === "warning" && <AlertTriangle className="w-5 h-5" />}
                                    {feedback.type === "error" && <AlertCircle className="w-5 h-5" />}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-lg leading-tight truncate">{feedback.message}</h3>
                                    {feedback.subtext && <p className="text-sm opacity-80 truncate">{feedback.subtext}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Scanner - Takes optimized visual space */}
                    <div className="w-full aspect-square max-h-[50vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group">
                        <QRScanner onScan={handleScan} />
                        <div className="absolute inset-0 border-[3px] border-white/20 rounded-3xl pointer-events-none group-hover:border-white/40 transition-colors"></div>
                        {/* Scan Area Indicators */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/50 rounded-2xl pointer-events-none">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500/80 -mt-0.5 -ml-0.5 rounded-tl-lg"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500/80 -mt-0.5 -mr-0.5 rounded-tr-lg"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500/80 -mb-0.5 -ml-0.5 rounded-bl-lg"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500/80 -mb-0.5 -mr-0.5 rounded-br-lg"></div>
                        </div>
                    </div>

                    {/* Controls & Inputs */}
                    <div className="w-full space-y-3 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                        <div className="flex gap-2 text-white">
                            <select
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(Number(e.target.value) as Day)}
                                className="flex-1 bg-white/10 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:bg-white/20 transition-colors"
                            >
                                {availableDays.map((d) => <option key={d} value={d} className="text-black">Day {d}</option>)}
                            </select>
                            <select
                                value={selectedPurpose}
                                onChange={(e) => setSelectedPurpose(e.target.value)}
                                className="flex-[2] bg-white/10 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:bg-white/20 transition-colors"
                            >
                                {availablePurposes.map((p) => <option key={p} value={p} className="text-black">{p}</option>)}
                            </select>
                        </div>

                        {/* Manual Entry Form */}
                        <form onSubmit={handleManualSubmit} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="ID (e.g. EVT-123)"
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value)}
                                className="flex-1 bg-white/10 border-none rounded-xl px-4 py-3 text-white placeholder:text-white/30 font-mono tracking-wider focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
                            />
                            <button
                                type="submit"
                                disabled={isProcessing || !manualId.trim()}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50 disabled:bg-white/10 transition-all active:scale-95"
                            >
                                GO
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Side Panel: Real-time Stats */}
            <StatsPanel
                delegates={delegates}
                records={records}
                selectedDay={selectedDay}
                selectedPurpose={selectedPurpose}
                onManualSelect={(id) => handleScan(id)}
                isOpen={isStatsOpen}
                onClose={() => setIsStatsOpen(false)}
            />
        </div>
    );
}
