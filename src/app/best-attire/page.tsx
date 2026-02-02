"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import { supabase } from "@/lib/supabase";
import { AttireEntry } from "@/types/attire";
import { Heart, Share2, Camera, X, Upload, Loader2 } from "lucide-react";
import DelegateGuard from "@/components/DelegateGuard";
import confetti from 'canvas-confetti';
import { cn } from "@/lib/utils";

export default function BestAttirePage() {
    const [entries, setEntries] = useState<AttireEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newEntry, setNewEntry] = useState({ name: '', caption: '', file: null as File | null });

    const searchParams = useSearchParams();
    const highlightId = searchParams.get('id');
    const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch entries
    const fetchEntries = async () => {
        try {
            const { data, error } = await supabase
                .from('best_attire_entries')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEntries((data as AttireEntry[]) || []);
        } catch (error) {
            console.error('Error fetching attire entries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();

        // Load likes
        const stored = localStorage.getItem('best_attire_likes');
        if (stored) {
            setLikedIds(new Set(JSON.parse(stored)));
        }

        // Subscribe to changes (for real-time like updates)
        const channel = supabase
            .channel('public:best_attire_entries')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'best_attire_entries'
                },
                (payload) => {
                    setEntries(prev => prev.map(e => e.id === payload.new.id ? { ...e, likes: payload.new.likes } : e));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Scroll to highlight
    useEffect(() => {
        if (!isLoading && highlightId && itemRefs.current[highlightId]) {
            setTimeout(() => {
                itemRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [isLoading, highlightId]);

    const handleLike = async (item: AttireEntry) => {
        if (likedIds.has(item.id)) return;

        // Vibrate
        if (navigator.vibrate) navigator.vibrate(50);

        // Optimistic UI
        const newLikes = (item.likes || 0) + 1;
        setEntries(prev => prev.map(e => e.id === item.id ? { ...e, likes: newLikes } : e));

        // Update Local State
        const newLikedIds = new Set(likedIds).add(item.id);
        setLikedIds(newLikedIds);
        localStorage.setItem('best_attire_likes', JSON.stringify(Array.from(newLikedIds)));

        // Confetti
        confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#E91A83', '#ff479d']
        });

        // DB Update
        try {
            const { error } = await supabase.rpc('increment_attire_like', { row_id: item.id });
            if (error) {
                // Fallback
                console.warn("RPC failed, trying direct update", error);
                await supabase.from('best_attire_entries').update({ likes: newLikes }).eq('id', item.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleShare = async (item: AttireEntry) => {
        const url = `${window.location.origin}/best-attire?id=${item.id}`;
        const shareData = {
            title: `Check out ${item.user_name}'s outfit!`,
            text: `Vote for ${item.user_name} on Rotasia Best Attire!`,
            url: url
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(url);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
            console.error("Error sharing:", err);
            await navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewEntry({ ...newEntry, file: e.target.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEntry.file || !newEntry.name) return;

        setUploading(true);
        try {
            // 1. Upload Image
            const fileExt = newEntry.file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('attire-entries')
                .upload(fileName, newEntry.file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('attire-entries')
                .getPublicUrl(fileName);

            // 3. Insert Entry
            const { error: dbError } = await supabase
                .from('best_attire_entries')
                .insert({
                    user_name: newEntry.name,
                    caption: newEntry.caption,
                    image_url: publicUrl,
                    status: 'pending'
                });

            if (dbError) throw dbError;

            alert("Entry submitted! It will be visible after approval.");
            setIsModalOpen(false);
            setNewEntry({ name: '', caption: '', file: null });

        } catch (error) {
            console.error('Error submitting:', error);
            // Check if error is related to bucket
            if (error instanceof Error && error.message.includes('bucket')) {
                alert('Storage bucket configuration error. Please contact admin.');
            } else {
                alert('Failed to submit entry. Please try again.');
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <DelegateGuard>
            <div className="min-h-screen bg-[#0B0B1C] text-white p-4 pb-20">
                <main className="max-w-6xl mx-auto pt-4 md:pt-10">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-2 drop-shadow-lg">
                            BEST ATTIRE
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto mb-6">
                            Show off your style! Share your look and collect likes to win.
                        </p>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-pink-600 hover:bg-pink-700 rounded-full font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(233,26,131,0.5)]"
                        >
                            <Camera className="w-5 h-5" />
                            Submit Your Look
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-300">No entries yet</h3>
                            <p className="text-gray-500 mt-2">Be the first to show off your outfit!</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-6 px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-full font-bold transition-colors"
                            >
                                Submit Photo
                            </button>
                        </div>
                    ) : (
                        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                            {entries.map((item) => (
                                <div
                                    key={item.id}
                                    ref={el => itemRefs.current[item.id] = el}
                                    className={cn(
                                        "break-inside-avoid bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:transform hover:-translate-y-1 transition-all duration-300 shadow-xl",
                                        highlightId === item.id ? "ring-2 ring-pink-500 shadow-[0_0_30px_rgba(233,26,131,0.3)] bg-white/10" : ""
                                    )}
                                >
                                    <div className="relative aspect-[3/4]">
                                        <img
                                            src={item.image_url}
                                            alt={item.user_name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                                    </div>

                                    <div className="p-4 relative -mt-20">
                                        <h3 className="text-xl font-bold text-white mb-1 truncate shadow-black drop-shadow-md">{item.user_name}</h3>
                                        {item.caption && <p className="text-gray-300 text-sm line-clamp-2 mb-4 drop-shadow-md">{item.caption}</p>}

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleLike(item)}
                                                    className={cn(
                                                        "p-2 rounded-full transition-all active:scale-95 group",
                                                        likedIds.has(item.id) ? "text-pink-500 bg-pink-500/10" : "text-gray-400 hover:bg-white/10 hover:text-white"
                                                    )}
                                                >
                                                    <Heart className={cn("w-6 h-6 transition-transform", likedIds.has(item.id) ? "fill-current scale-110" : "group-hover:scale-110")} />
                                                </button>
                                                <span className="font-bold text-lg tabular-nums">{item.likes || 0}</span>
                                            </div>

                                            <button
                                                onClick={() => handleShare(item)}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95 flex items-center gap-2"
                                                title="Share to get votes"
                                            >
                                                <span className="text-xs font-medium uppercase tracking-wider hidden sm:block">Share</span>
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submission Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <h2 className="text-2xl font-bold text-white mb-6">Submit Entry</h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Image Upload */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn(
                                            "border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors aspect-[3/4] relative overflow-hidden group",
                                            newEntry.file ? "border-pink-500/50 bg-pink-500/5" : ""
                                        )}
                                    >
                                        {newEntry.file ? (
                                            <div className="absolute inset-0 z-10">
                                                <img
                                                    src={URL.createObjectURL(newEntry.file)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                />
                                                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-center text-xs text-white">Click to change</div>
                                            </div>
                                        ) : (
                                            <div className="text-center z-20">
                                                <div className="bg-white/10 text-gray-400 p-3 rounded-full inline-block mb-3">
                                                    <Upload className="w-8 h-8" />
                                                </div>
                                                <p className="text-sm text-gray-300 font-medium">Upload Photo</p>
                                                <p className="text-xs text-gray-500 mt-1">Tap to select</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>

                                    {/* Name Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Your Name</label>
                                        <input
                                            type="text"
                                            value={newEntry.name}
                                            onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>

                                    {/* Caption Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Caption <span className="text-gray-600">(Optional)</span></label>
                                        <textarea
                                            value={newEntry.caption}
                                            onChange={(e) => setNewEntry({ ...newEntry, caption: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 outline-none h-20 resize-none"
                                            placeholder="Describe your look..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={uploading || !newEntry.file || !newEntry.name}
                                        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {uploading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                                        ) : (
                                            "Submit Entry"
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </DelegateGuard>
    );
}
