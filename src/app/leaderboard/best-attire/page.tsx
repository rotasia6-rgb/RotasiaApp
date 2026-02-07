"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Nomination } from "@/types/voting";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to transform Google Drive URLs to direct image links
const getOptimizedImageUrl = (url: string | null) => {
    if (!url) return '/placeholder.png';

    // Handle Google Drive URLs
    if (url.includes('drive.google.com')) {
        // Extract ID
        const idMatch = url.match(/[-\w]{25,}/);
        if (idMatch) {
            return `https://lh3.googleusercontent.com/d/${idMatch[0]}`;
        }
    }

    return url;
};

export default function BestAttireLeaderboard() {
    const [entries, setEntries] = useState<Nomination[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
    const [selectedEntry, setSelectedEntry] = useState<Nomination | null>(null);

    // Fetch entries
    const fetchEntries = async () => {
        try {
            const { data, error } = await supabase
                .from('nominations')
                .select('*')
                // Show ALL entries (approved or pending)
                .order('votes', { ascending: false });

            if (error) throw error;
            setEntries((data as Nomination[]) || []);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();

        const channel = supabase
            .channel('public:nominations')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'nominations' },
                (payload) => {
                    setEntries(prev => prev.map(e => e.id === payload.new.id ? { ...e, votes: payload.new.votes } : e));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Filter and Group Entries by DATE
    const filteredEntries = entries.filter(e => e.gender === selectedGender);

    // Helper to get day from date (5-8 Feb)
    const getDayFromEntry = (entry: Nomination) => {
        if (!entry.created_at) return 1; // Default
        const date = new Date(entry.created_at);
        // Correct time zone offset if needed, or stick to UTC/local mapping?
        // Assuming dates are local:
        const d = date.getDate();
        const m = date.getMonth(); // 1 = Feb

        if (m === 1) { // Feb
            if (d === 5) return 1;
            if (d === 6) return 2;
            if (d === 7) return 3;
            if (d === 8) return 4;
        }
        return 1; // Default to Day 1 for safety
    };

    const groupedEntries = {
        1: filteredEntries.filter(e => getDayFromEntry(e) === 1).sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 10),
        2: filteredEntries.filter(e => getDayFromEntry(e) === 2).sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 10),
        3: filteredEntries.filter(e => getDayFromEntry(e) === 3).sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 10),
        4: filteredEntries.filter(e => getDayFromEntry(e) === 4).sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 10),
    };

    return (
        <div className="min-h-screen bg-[#0B0B1C] text-white p-4 md:p-8">
            <header className="flex flex-col items-center mb-8">
                <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-6 drop-shadow-lg uppercase tracking-wider">
                    Best Attire Leaderboard
                </h1>

                {/* Gender Toggle */}
                <div className="flex bg-white/5 p-1 rounded-xl backdrop-blur-sm border border-white/10 w-full max-w-md">
                    <button
                        onClick={() => setSelectedGender('male')}
                        className={cn(
                            "flex-1 py-3 px-6 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300",
                            selectedGender === 'male'
                                ? "bg-blue-600/20 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-500/30"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        Best Attire Male
                    </button>
                    <button
                        onClick={() => setSelectedGender('female')}
                        className={cn(
                            "flex-1 py-3 px-6 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300",
                            selectedGender === 'female'
                                ? "bg-pink-600/20 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)] border border-pink-500/30"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        Best Attire Female
                    </button>
                </div>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((day) => (
                        <div key={day} className="flex flex-col h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                            <div className="bg-white/5 p-4 border-b border-white/10 text-center">
                                <h2 className="text-xl font-bold text-gray-200">Day {day}</h2>
                            </div>

                            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[70vh] custom-scrollbar">
                                {groupedEntries[day as 1 | 2 | 3 | 4].length === 0 ? (
                                    <div className="text-center py-10 text-gray-500 text-sm">No entries yet</div>
                                ) : (
                                    groupedEntries[day as 1 | 2 | 3 | 4].map((item, index) => (
                                        <div
                                            key={item.id}
                                            onClick={() => setSelectedEntry(item)}
                                            className="group relative flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl transition-all cursor-pointer active:scale-95"
                                        >
                                            {/* Rank Badge */}
                                            <div className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shadow-lg border border-white/10",
                                                index === 0 ? "bg-yellow-500 text-black" :
                                                    index === 1 ? "bg-gray-300 text-black" :
                                                        index === 2 ? "bg-amber-700 text-white" :
                                                            "bg-white/10 text-gray-400"
                                            )}>
                                                {index + 1}
                                            </div>

                                            {/* Thumbnail */}
                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                                <img
                                                    src={getOptimizedImageUrl(item.contestant_photo || null)}
                                                    alt={item.contestant_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white truncate text-sm">{item.contestant_name}</h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-gray-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                                                        {item.votes} Votes
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for viewing image */}
            {selectedEntry && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setSelectedEntry(null)}
                >
                    <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row bg-[#1a1a2e] rounded-2xl overflow-hidden border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
                            onClick={() => setSelectedEntry(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex-1 bg-black flex items-center justify-center p-2 relative">
                            <img
                                src={getOptimizedImageUrl(selectedEntry.contestant_photo || null)}
                                alt={selectedEntry.contestant_name}
                                className="max-w-full max-h-[60vh] md:max-h-[85vh] object-contain rounded-lg"
                            />
                        </div>

                        <div className="w-full md:w-80 bg-[#1a1a2e] p-6 flex flex-col border-l border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-2">{selectedEntry.contestant_name}</h2>
                            <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full w-fit mb-4 border border-white/10">
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    selectedEntry.gender === 'male' ? "bg-blue-500" : "bg-pink-500"
                                )}></span>
                                <span className="text-xs font-medium uppercase text-gray-300">
                                    {selectedEntry.gender === 'male' ? 'Best Attire Male' : 'Best Attire Female'}
                                </span>
                            </div>

                            {selectedEntry.caption && (
                                <p className="text-gray-400 text-sm mb-6 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                    "{selectedEntry.caption}"
                                </p>
                            )}

                            <div className="mt-auto pt-6 border-t border-white/10">
                                <div className="text-center">
                                    <span className="block text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500">
                                        {selectedEntry.votes}
                                    </span>
                                    <span className="text-gray-500 text-sm uppercase tracking-widest font-medium">Total Votes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
