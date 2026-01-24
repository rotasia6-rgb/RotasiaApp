"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Nomination } from "@/types/voting";
import { Heart, Trophy, Crown, Share2 } from "lucide-react";
import confetti from 'canvas-confetti';

export default function VotingPage() {
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
            // Revert changes if needed (omitted for simplicity)
        }
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown className="w-8 h-8 text-yellow-400 drop-shadow-lg animate-bounce" />;
        if (index === 1) return <div className="text-2xl">🥈</div>;
        if (index === 2) return <div className="text-2xl">🥉</div>;
        return <div className="text-gray-500 font-bold">#{index + 1}</div>;
    };

    return (
        <div className="min-h-screen bg-[#0B0B1C] p-4 pb-20">
            <header className="text-center py-8 mb-6">
                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E91A83] to-[#4C24C1] uppercase tracking-tighter drop-shadow-sm">
                    Best Outfit
                </h1>
                <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest">Vote for the style icons</p>
            </header>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="w-12 h-12 border-4 border-[#E91A83] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="max-w-md mx-auto space-y-4">
                    {nominations.map((item, index) => (
                        <div
                            key={item.id}
                            className={`
                                relative p-4 rounded-2xl flex items-center gap-4 transition-all duration-500
                                ${index === 0 ? 'bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 scale-105 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'bg-white/5 border border-white/10'}
                            `}
                        >
                            <div className="flex-shrink-0 w-12 flex justify-center">
                                {getRankIcon(index)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-bold text-lg truncate">{item.contestant_name}</h3>
                                <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#E91A83] to-[#4C24C1] transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min((item.votes / (nominations[0]?.votes || 1)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <button
                                    onClick={() => handleVote(item.id)}
                                    // disabled={votedIds.has(item.id)}
                                    className={`
                                        p-3 rounded-xl transition-all active:scale-95
                                        ${votedIds.has(item.id)
                                            ? 'bg-[#E91A83] text-white shadow-lg shadow-[#E91A83]/30 scale-105 ring-2 ring-[#ff6ec1]'
                                            : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'}
                                    `}
                                >
                                    <Heart className={`w-6 h-6 ${votedIds.has(item.id) ? 'fill-current' : ''}`} />
                                </button>
                                <span className="text-xs font-bold text-gray-400">{item.votes}</span>
                            </div>
                        </div>
                    ))}

                    {nominations.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No contestants yet. Check back soon!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
