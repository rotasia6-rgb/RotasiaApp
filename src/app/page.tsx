import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0B0B1C] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600 rounded-full blur-[120px] opacity-20 animate-pulse delay-700"></div>
                <div className="absolute top-[20%] left-[40%] w-[30%] h-[30%] bg-blue-600 rounded-full blur-[100px] opacity-10 animate-pulse delay-1000"></div>
            </div>

            <main className="z-10 w-full max-w-5xl flex flex-col items-center gap-10">
                {/* Header Section */}
                <div className="text-center space-y-6 animate-in slide-in-from-top duration-700">
                    <div className="relative inline-block group">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                        <img
                            src="/Logo.png"
                            alt="Rotasia Logo"
                            className="h-28 md:h-40 mx-auto drop-shadow-2xl relative z-10 transform group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    <div>
                        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 tracking-tight mb-2 pb-2 drop-shadow-lg">
                            Delegate Tracker
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto font-light tracking-wide">
                            Experience Rotasia 2026 like never before.
                        </p>
                    </div>
                </div>

                {/* Navigation Grid */}
                <div className="w-full px-4 md:px-0">

                    {/* Primary Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">

                        {/* Find My Room - Main Feature */}
                        <Link href="/find-my-room" className="group relative col-span-1 md:col-span-2 lg:col-span-1 row-span-2 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 p-8 hover:border-purple-500/60 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                <div className="p-4 rounded-2xl bg-purple-500/20 w-fit text-purple-300 group-hover:text-white group-hover:bg-purple-500 transition-colors duration-300 shadow-lg shadow-purple-900/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">Find My Room</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300">
                                        Locate your accommodation, view roommates, and access coordinator details instantly.
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Best Attire */}
                        <Link href="/dashboard/voting" className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.4a1.6 1.6 0 0 1 .5 1.48l-1.93 11.23a2.4 2.4 0 0 1-2.3 2H7.35a2.4 2.4 0 0 1-2.3-2L3.12 4.88a1.6 1.6 0 0 1 .5-1.48 1.62 1.62 0 0 1 1.48-.65h13.8a1.62 1.62 0 0 1 1.48.65z" /><path d="M12 8v13" /><path d="M12 21h-2" /><path d="M12 21h2" /></svg>
                                </div>
                                <span className="bg-pink-500/10 text-pink-300 text-[10px] font-bold px-2 py-1 rounded-full border border-pink-500/20">HOT</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-pink-200">Best Attire</h3>
                            <p className="text-gray-400 text-xs">Vote for the best dressed style icons.</p>
                        </Link>

                        {/* Feedback */}
                        <Link href="/feedback/submit" className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-red-500/20 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-red-200">Feedback</h3>
                            <p className="text-gray-400 text-xs">Share your Rotasia moments & love.</p>
                        </Link>

                        {/* Live Voting */}
                        <Link href="/voting" className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4" /></svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-200">Live Voting</h3>
                            <p className="text-gray-400 text-xs">Participate in live event polls.</p>
                        </Link>

                        {/* Food Feedback */}
                        <Link href="/food-feedback" className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-green-500/20 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" /></svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-200">Food Feedback</h3>
                            <p className="text-gray-400 text-xs">Rate your culinary experience.</p>
                        </Link>



                    </div>

                    {/* Admin Section - Minimalist */}
                    <div className="mt-12 flex justify-center">
                        <Link href="/login" className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium backdrop-blur-sm">
                            <span className="text-lg">🔐</span>
                            <span>Organizer Login</span>
                        </Link>
                    </div>

                </div>
            </main>

            <footer className="z-10 mt-12 text-gray-500 text-sm font-light">
                <p>&copy; 2026 Rotasia Chennai. crafted with ❤️.</p>
            </footer>
        </div>
    );
}
