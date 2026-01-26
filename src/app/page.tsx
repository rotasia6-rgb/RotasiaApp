import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0B0B1C] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600 rounded-full blur-[120px] opacity-20 animate-pulse delay-700"></div>
            </div>

            <main className="z-10 w-full max-w-4xl flex flex-col items-center gap-12">
                {/* Header Section */}
                <div className="text-center space-y-4 slide-in-from-top">
                    <img
                        src="https://rotasia2026chennai.com/wp-content/uploads/2024/07/logo-text-1.png"
                        alt="Rotasia Logo"
                        className="h-24 md:h-32 mx-auto drop-shadow-2xl"
                    />
                    <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                        Delegate Tracker
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                        The official administration and utility portal for Rotasia 2026 Chennai.
                    </p>
                </div>

                {/* Navigation Grid */}
                <div className="w-full px-4 md:px-0 space-y-8">

                    {/* Public Events Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4 pl-2 border-l-4 border-pink-500">Event Highlights</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <Link href="/mr-ms-rotasia" className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-[1.02]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-pink-500/20 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors">👑</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Mr. & Ms. Rotasia</h3>
                                        <p className="text-gray-400 text-xs">Register to be the face of Rotasia 2026</p>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/open-mic" className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-[1.02]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">🎤</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Open Mic Contest</h3>
                                        <p className="text-gray-400 text-xs">Showcase your talent to the world</p>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/idea-for-rotaract" className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-[1.02]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">💡</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">My Idea for Rotaract</h3>
                                        <p className="text-gray-400 text-xs">Submit your project idea for India</p>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/speed-networking" className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-[1.02]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">🤝</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Speed Networking</h3>
                                        <p className="text-gray-400 text-xs">Connect with delegates instantly</p>
                                    </div>
                                </div>
                            </Link>

                        </div>
                    </div>

                    {/* Delegate Utility Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4 pl-2 border-l-4 border-purple-500">Delegate Zone</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                            <Link href="/find-my-room" className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">🏠</div>
                                    <div>
                                        <h3 className="text-md font-bold text-white">Find My Room</h3>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/coming-soon" className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">👗</div>
                                    <div>
                                        <h3 className="text-md font-bold text-white">Best Attire</h3>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/coming-soon" className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">❤️</div>
                                    <div>
                                        <h3 className="text-md font-bold text-white">Wall of Love</h3>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/coming-soon" className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-colors">📊</div>
                                    <div>
                                        <h3 className="text-md font-bold text-white">Live Voting</h3>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/coming-soon" className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-green-500/20 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">🍽️</div>
                                    <div>
                                        <h3 className="text-md font-bold text-white">Food Feedback</h3>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/coming-soon" className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">🎁</div>
                                    <div>
                                        <h3 className="text-md font-bold text-white">Surprise</h3>
                                    </div>
                                </div>
                            </Link>

                        </div>
                    </div>

                    {/* Admin Section */}
                    <div className="pt-4 border-t border-white/10">
                        <div className="flex justify-center gap-4">
                            <Link href="/login" className="text-gray-500 hover:text-white text-sm transition-colors flex items-center gap-2">
                                <span>🔐</span> Organizer Login
                            </Link>
                        </div>
                    </div>

                </div>
            </main>

            <footer className="z-10 mt-16 text-gray-400 text-sm">
                <p>&copy; 2026 Rotasia Chennai. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
