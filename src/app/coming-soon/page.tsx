'use client';

import Link from 'next/link';

export default function ComingSoonPage() {
    return (
        <div className="min-h-screen bg-[#0B0B1C] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[30%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[150px] opacity-20 animate-pulse"></div>
            </div>

            <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 text-center animate-fade-in-up">

                <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-6 font-heading">
                    Coming Soon
                </h1>

                <p className="text-gray-300 text-2xl font-semibold mb-8">
                    Wait for the Event Day! 🚀
                </p>

                <div className="p-6 bg-purple-900/20 border border-purple-500/30 rounded-xl mb-8">
                    <p className="text-purple-200">This feature will be unlocked during Rotasia 2026.</p>
                </div>

                <Link href="/" className="inline-block px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-semibold transition-all">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
