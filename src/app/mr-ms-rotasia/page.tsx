'use client';

import Link from 'next/link';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-heading' });

export default function MrMsRotasiaPage() {
    return (
        <div className={`min-h-screen bg-[#0B0B1C] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden ${inter.variable} ${plusJakarta.variable}`} style={{ fontFamily: 'var(--font-body)' }}>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600 rounded-full blur-[120px] opacity-20 animate-pulse delay-700"></div>
            </div>

            <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 animate-fade-in-up">

                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-4 font-heading">
                        Mr. & Ms. Rotasia
                    </h1>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-8 rounded-2xl text-center backdrop-blur-md">
                    <div className="text-4xl mb-4">🚫</div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">Registrations Closed</h2>
                    <p className="text-gray-300 text-lg">
                        Thank you for your overwhelming response! <br />
                        The registration application period for Mr. & Ms. Rotasia has officially ended.
                    </p>
                    <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-sm text-gray-400">
                            Updates on the shortlisted candidates will be announced soon. Stay tuned to our social media channels.
                        </p>
                    </div>
                </div>

                <div className="text-center mt-10">
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all text-sm font-medium border border-white/10">
                        <span>←</span> Back to Home
                    </Link>
                </div>
            </div>

            <footer className="mt-12 text-gray-500 text-sm relative z-10">
                <p>© 2026 Rotasia Chennai. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
