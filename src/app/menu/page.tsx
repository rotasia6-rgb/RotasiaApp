"use client";

import Link from "next/link";
import { Home, Trophy, MessageSquare, ArrowRight, User, Sparkles } from "lucide-react";

export default function DelegateHubPage() {
    return (
        <div className="min-h-screen bg-[#0B0B1C] flex flex-col relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600 rounded-full blur-[120px] opacity-20"></div>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-lg mx-auto">
                <div className="text-center mb-10 animate-fade-in-down">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-3 drop-shadow-lg">
                        Rotasia 2026
                    </h1>
                    <p className="text-gray-400 text-lg">Welcome Delegate! What would you like to do?</p>
                </div>

                <div className="grid gap-6 w-full">
                    {/* Find My Room */}
                    <Link href="/find-my-room" className="group">
                        <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-500/30 p-6 rounded-2xl flex items-center justify-between backdrop-blur-md shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                                    <Home className="w-8 h-8 text-blue-300" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Find My Room</h2>
                                    <p className="text-blue-200/60 text-sm">Check allocation & roommates</p>
                                </div>
                            </div>
                            <div className="bg-white/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </Link>

                    {/* Speed Networking */}
                    <Link href="/speed-networking" className="group">
                        <div className="bg-gradient-to-r from-cyan-900/40 to-cyan-800/40 border border-cyan-500/30 p-6 rounded-2xl flex items-center justify-between backdrop-blur-md shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-cyan-500/20 rounded-xl group-hover:bg-cyan-500/30 transition-colors">
                                    <Sparkles className="w-8 h-8 text-cyan-300" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Speed Networking</h2>
                                    <p className="text-cyan-200/60 text-sm">Connect with Rotaractors</p>
                                </div>
                            </div>
                            <div className="bg-white/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </Link>

                    {/* Best Attire Voting */}
                    <Link href="/voting" className="group">
                        <div className="bg-gradient-to-r from-pink-900/40 to-pink-800/40 border border-pink-500/30 p-6 rounded-2xl flex items-center justify-between backdrop-blur-md shadow-lg hover:shadow-pink-500/20 hover:scale-[1.02] transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-pink-500/20 rounded-xl group-hover:bg-pink-500/30 transition-colors">
                                    <Trophy className="w-8 h-8 text-pink-300" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Best Attire Voting</h2>
                                    <p className="text-pink-200/60 text-sm">Vote for Mr. & Ms. Rotasia</p>
                                </div>
                            </div>
                            <div className="bg-white/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </Link>

                    {/* Feedback */}
                    <Link href="/feedback" className="group">
                        <div className="bg-gradient-to-r from-green-900/40 to-green-800/40 border border-green-500/30 p-6 rounded-2xl flex items-center justify-between backdrop-blur-md shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                                    <MessageSquare className="w-8 h-8 text-green-300" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Feedback</h2>
                                    <p className="text-green-200/60 text-sm">Share your experience</p>
                                </div>
                            </div>
                            <div className="bg-white/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </Link>
                </div>
            </main>

            <footer className="p-6 text-center text-gray-600 text-sm relative z-10">
                <p>© 2026 Rotasia Chennai</p>
            </footer>
        </div>
    );
}
