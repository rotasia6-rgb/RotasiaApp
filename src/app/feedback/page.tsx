"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Send, CheckCircle, Loader2, Sparkles } from "lucide-react";

export default function FeedbackPage() {
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim()) return;

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('feedback')
                .insert([
                    { name, message, status: 'pending' }
                ]);

            if (error) throw error;

            setIsSuccess(true);
            setName("");
            setMessage("");
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#0B0B1C] flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in-up">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-500/20 p-4 rounded-full">
                            <CheckCircle className="w-16 h-16 text-green-400" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Thank You!</h2>
                    <p className="text-gray-300 mb-8 text-lg">
                        Your feedback has been received and is awaiting approval. We appreciate your thoughts!
                    </p>
                    <button
                        onClick={() => setIsSuccess(false)}
                        className="bg-gradient-to-r from-[#E91A83] to-[#4C24C1] text-white font-bold py-3 px-8 rounded-full hover:shadow-[0_0_20px_rgba(233,26,131,0.5)] transition-all transform hover:scale-105"
                    >
                        Submit Another
                    </button>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <a href="/feedback/wall" className="text-sm text-[#E91A83] hover:text-[#ff3fa5] font-medium flex items-center justify-center gap-2 transition-colors">
                            <Sparkles className="w-4 h-4" /> View Feedback Wall
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B1C] relative overflow-hidden flex flex-col items-center justify-center p-4">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4C24C1] rounded-full blur-[120px] opacity-30"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E91A83] rounded-full blur-[120px] opacity-30"></div>
            </div>

            <main className="w-full max-w-lg z-10 relative">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
                        Your Voice Matters
                    </h1>
                    <p className="text-gray-400 text-lg">Share your experience with us</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2 pl-1">
                                Your Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E91A83] transition-all"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2 pl-1">
                                Feedback
                            </label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E91A83] transition-all resize-none"
                                placeholder="Share your thoughts, suggestions, or potential improvements..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-[#E91A83] to-[#4C24C1] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-[#E91A83]/25 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    Send Feedback
                                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center animate-pulse">
                    <a href="/feedback/wall" className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-gray-300 text-sm font-medium backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-[#E91A83]" />
                        See what others are saying
                    </a>
                </div>
            </main>
        </div>
    );
}
