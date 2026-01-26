'use client';

import DelegateGuard from '@/components/DelegateGuard';

export default function BestAttirePage() {
    return (
        <DelegateGuard>
            <div className="min-h-screen bg-[#0B0B1C] text-white p-4">
                <main className="max-w-4xl mx-auto pt-10">
                    <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-8 text-center">
                        Best Attire Contest
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Placeholder for Content - Maybe an upload form or voting interface */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                            <div className="text-6xl mb-4">📸</div>
                            <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
                            <p className="text-gray-400">The Best Attire voting will open on the event day.</p>
                        </div>
                    </div>
                </main>
            </div>
        </DelegateGuard>
    );
}
