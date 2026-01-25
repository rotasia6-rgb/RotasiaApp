"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Nomination } from "@/types/voting";
import { Heart, Trophy, Crown, Share2 } from "lucide-react";
import confetti from 'canvas-confetti';

export default function VotingPage() {
    const [activeTab, setActiveTab] = useState<'male' | 'female'>('male');
    const [nominations, setNominations] = useState<Nomination[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

    const fetchNominations = async () => {
        try {
            const { data, error } = await supabase
                .from('nominations')
                .select('*')
                .order('votes', { ascending: false });

            if (error) throw error;
            setNominations((data as Nomination[]) || []);
        } catch (error) {
            console.error('Error fetching nominations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNominations();

        // Realtime updates for votes
        const channel = supabase
            .channel('public:nominations')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'nominations'
                },
                () => {
                    fetchNominations();
                }
            )
            .subscribe();

        // Load prev votes from local storage
        const storedVotes = localStorage.getItem('rotasia_voted_ids');
        if (storedVotes) {
            setVotedIds(new Set(JSON.parse(storedVotes)));
        }

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleVote = async (id: string) => {
        if (votedIds.has(id)) return;

        // Vibrate for haptic feedback on mobile
        if (navigator.vibrate) navigator.vibrate(50);

        // Optimistic UI update
        setNominations(prev =>
            prev.map(n => n.id === id ? { ...n, votes: n.votes + 1 } : n)
                .sort((a, b) => b.votes - a.votes) // Re-sort locally
        );

        // Trigger confetti
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#E91A83', '#4C24C1']
        });

        // Store vote locally
        const newVotedIds = new Set(votedIds).add(id);
        setVotedIds(newVotedIds);
        localStorage.setItem('rotasia_voted_ids', JSON.stringify(Array.from(newVotedIds)));

        try {
            const { error } = await supabase.rpc('increment_vote', { row_id: id });
            if (error) {
                // Fallback for direct update if RPC fails
                const current = nominations.find(n => n.id === id);
                if (current) {
                    await supabase
                        .from('nominations')
                        .update({ votes: current.votes + 1 })
                        .eq('id', id);
                }
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown className="w-8 h-8 text-yellow-400 drop-shadow-lg animate-bounce" />;
        if (index === 1) return <div className="text-2xl">🥈</div>;
        if (index === 2) return <div className="text-2xl">🥉</div>;
        return <div className="text-gray-500 font-bold">#{index + 1}</div>;
    };

    const getOptimizedImageUrl = (url: string) => {
        if (!url) return '';

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

    const maleNominations = nominations
        .filter(n => n.gender === 'male' || !n.gender)
        .sort((a, b) => b.votes - a.votes);

    const femaleNominations = nominations
        .filter(n => n.gender === 'female')
        .sort((a, b) => b.votes - a.votes);

    const renderList = (items: Nomination[], title: string, gradientFrom: string, gradientTo: string) => (
        <div className="w-full">
            <h2 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r ${gradientFrom} ${gradientTo} text-center uppercase tracking-wider`}>
                {title}
            </h2>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className={`
                            relative group overflow-hidden rounded-2xl aspect-[3/4] transition-all duration-500
                            ${index < 3 ? 'ring-2 ring-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'ring-1 ring-white/10'}
                        `}
                    >
                        {/* Background Image */}
                        {item.contestant_photo ? (
                            <img
                                src={getOptimizedImageUrl(item.contestant_photo)}
                                alt={item.contestant_name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => {
                                    // Fallback if optimized URL fails
                                    const target = e.target as HTMLImageElement;
                                    if (target.src.includes('lh3.googleusercontent.com')) {
                                        // Try standard export view fallback
                                        const idMatch = item.contestant_photo?.match(/[-\w]{25,}/);
                                        if (idMatch) {
                                            target.src = `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center">
                                <span className="text-4xl opacity-20 filter grayscale">✨</span>
                            </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                        {/* Rank Badge */}
                        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            {index === 0 ? (
                                <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
                            ) : (
                                <span className={`text-sm font-bold ${index < 3 ? 'text-yellow-400' : 'text-white/80'}`}>
                                    #{index + 1}
                                </span>
                            )}
                        </div>

                        {/* Content Bottom */}
                        <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col gap-3">
                            <div>
                                <h3 className="text-white font-bold text-lg md:text-xl truncate leading-tight">
                                    {item.contestant_name}
                                </h3>

                                {/* Progress Bar */}
                                <div className="w-full bg-white/20 rounded-full h-1 mt-2 overflow-hidden backdrop-blur-sm">
                                    <div
                                        className={`h-full bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
                                        style={{ width: `${Math.min((item.votes / ((title.includes('Male') ? maleNominations : femaleNominations)[0]?.votes || 1)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white/80">
                                    <span className="text-white font-bold text-lg mr-1">{item.votes}</span>
                                    votes
                                </span>

                                <button
                                    onClick={() => handleVote(item.id)}
                                    className={`
                                        p-3 rounded-full transition-all active:scale-90
                                        ${votedIds.has(item.id)
                                            ? 'bg-[#E91A83] text-white shadow-lg shadow-[#E91A83]/40 scale-105'
                                            : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}
                                    `}
                                >
                                    <Heart className={`w-6 h-6 ${votedIds.has(item.id) ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        No contestants yet.
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B0B1C] p-2 md:p-4 pb-20">
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="w-12 h-12 border-4 border-[#E91A83] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-2 md:px-4">
                    {renderList(maleNominations, "Best Attire Male", "from-[#4C24C1]", "to-[#6d4aff]")}
                    {renderList(femaleNominations, "Best Attire Female", "from-[#E91A83]", "to-[#ff479d]")}
                </div>
            )}
        </div>
    );
}
