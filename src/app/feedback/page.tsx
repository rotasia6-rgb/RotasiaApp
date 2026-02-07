"use client";

import { MessageSquare, Camera, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function FeedbackLandingPage() {
    return (
        <div className="min-h-screen bg-[#0B0B1C] text-white overflow-hidden relative flex flex-col items-center justify-center p-6">

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4C24C1] rounded-full blur-[150px] opacity-20"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#E91A83] rounded-full blur-[150px] opacity-20"></div>
            </div>

            <main className="w-full max-w-lg relative z-10 flex flex-col gap-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/10 mb-2 ring-1 ring-white/20 shadow-lg shadow-purple-500/20 backdrop-blur-xl">
                        <Sparkles className="w-6 h-6 text-[#E91A83]" />
                    </div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-sm tracking-tight">
                        Rotasia Connect
                    </h1>
                    <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-sm mx-auto">
                        Your voice matters! Share your feedback or join the contest.
                    </p>
                </div>

                <div className="grid gap-5">
                    {/* Feedback Button */}
                    <Link href="/feedback/submit" className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                        <div className="relative bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-5 hover:bg-white/10 transition-all duration-300 active:scale-[0.98]">
                            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-4 rounded-xl shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
                                <MessageSquare className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">Give Feedback</h3>
                                <p className="text-sm text-gray-400 font-medium group-hover:text-gray-300">Share your thoughts with us</p>
                            </div>
                            <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-white" />
                            </div>
                        </div>
                    </Link>

                    {/* Contestant Application Button */}
                    <a href="https://rotasia2026.com/dashboard/voting" className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                        <div className="relative bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-5 hover:bg-white/10 transition-all duration-300 active:scale-[0.98]">
                            <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-4 rounded-xl shadow-lg shadow-pink-500/30 group-hover:shadow-pink-500/50 transition-shadow">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">Apply for Contest</h3>
                                <p className="text-sm text-gray-400 font-medium group-hover:text-gray-300">Submit your Best Attire entry</p>
                            </div>
                            <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-white" />
                            </div>
                        </div>
                    </a>
                </div>

                <p className="text-center text-xs text-gray-600 font-medium tracking-widest uppercase mt-8 opacity-60">
                    Rotasia 2024
                </p>
            </main>
        </div>
    );
}
