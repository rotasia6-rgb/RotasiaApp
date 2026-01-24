"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Feedback } from "@/types/feedback";
import { Quote } from "lucide-react";
import styles from './wall.module.css';

export default function FeedbackWallPage() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchApprovedFeedbacks = async () => {
        try {
            const { data, error } = await supabase
                .from('feedback')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFeedbacks((data as Feedback[]) || []);
        } catch (error) {
            console.error('Error fetching wall feeds:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovedFeedbacks();

        // Realtime subscription for new approved feedback
        const channel = supabase
            .channel('public:feedback')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'feedback',
                    filter: 'status=eq.approved'
                },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchApprovedFeedbacks(); // Simplest way to keep sync
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0B1C] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#E91A83] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-[#0B0B1C] overflow-hidden relative ${styles.wallContainer}`}>
            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-[#4C24C1] rounded-full blur-[150px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-[#E91A83] rounded-full blur-[150px] opacity-20 duration-[10s] animate-pulse"></div>
            </div>

            <header className="relative z-10 p-8 text-center">
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 font-sans tracking-tight mb-4 drop-shadow-lg">
                    WALL OF LO<span className="text-[#E91A83]">V</span>E
                </h1>
                <p className="text-gray-400 text-lg md:text-xl font-light tracking-wide uppercase">
                    What people are saying about Rotasia Chennai 2026
                </p>
            </header>

            <main className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto">
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {feedbacks.map((item, index) => (
                        <div
                            key={item.id}
                            className="break-inside-avoid bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:translate-y-[-5px] hover:bg-white/10 transition-all duration-300 shadow-xl group"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <Quote className="text-[#E91A83] w-10 h-10 mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />

                            <p className="text-gray-200 text-lg leading-relaxed font-light mb-6">
                                "{item.message}"
                            </p>

                            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#E91A83] to-[#4C24C1] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {item.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-base tracking-wide">{item.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
                                        <span>Delegate</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {feedbacks.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-xl">Waiting for the first spark...</p>
                    </div>
                )}
            </main>

            {/* Footer / CTA */}
            <div className="fixed bottom-8 right-8 z-20">
                <a
                    href="/feedback"
                    className="flexItems-center justify-center bg-white text-[#0B0B1C] w-16 h-16 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform flex items-center justify-center font-bold text-2xl"
                    title="Add your feedback"
                >
                    +
                </a>
            </div>
        </div>
    );
}
