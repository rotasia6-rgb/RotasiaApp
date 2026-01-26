'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-heading' });

// Configuration
const FORM_SUPABASE_URL = process.env.NEXT_PUBLIC_ROTASIA_FORM_URL || 'https://cokrhsjbkkhrrimrzmgy.supabase.co';
const FORM_SUPABASE_KEY = process.env.NEXT_PUBLIC_ROTASIA_FORM_KEY || 'sb_publishable_w5KN2D0Zy1-g3AeoDP6icQ_zfekGSLS';

const supabase = createClient(FORM_SUPABASE_URL, FORM_SUPABASE_KEY);

export default function OpenMicPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMessage(null);

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            // Using assumed table 'open_mic_registrations'
            const payload = {
                full_name: formData.get('fullName'),
                club_name: formData.get('clubName'),
                district: formData.get('district'),
                phone: formData.get('phone'),
                performance_type: formData.get('performanceType')
            };

            const { error } = await supabase
                .from('open_mic_registrations')
                .insert([payload]);

            if (error) throw error;

            setSuccessMessage('Registered Successfully! We will contact you soon.');
            form.reset();
            setTimeout(() => setSuccessMessage(null), 5000);

        } catch (error: any) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen bg-[#0B0B1C] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden ${inter.variable} ${plusJakarta.variable}`} style={{ fontFamily: 'var(--font-body)' }}>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-amber-600 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
            </div>

            <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 my-12 animate-fade-in-up">

                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 mb-4 font-heading">
                        Open Mic Contest
                    </h1>
                    <p className="text-gray-300 text-lg">A Platform to Showcase Your Talent</p>
                </div>

                <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/5 text-center">
                    <p className="mb-4 text-gray-300">Whether it’s singing, speaking, comedy, poetry, storytelling, or any unique performance — this is your chance to shine.</p>
                    <div className="inline-block px-6 py-2 bg-amber-500/20 rounded-full border border-amber-500/30 text-amber-300 font-bold mb-4">
                        Sing | Speak | Perform | Express
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                        <input type="text" name="fullName" required placeholder="Your Name"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Club Name</label>
                        <input type="text" name="clubName" required placeholder="e.g. RAC Chennai"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">RI District</label>
                        <input type="text" name="district" required placeholder="e.g. 3232"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
                        <input type="tel" name="phone" required placeholder="+91 9876543210"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Type of Performance</label>
                        <input type="text" name="performanceType" required placeholder="Singing, Comedy, Poetry, etc."
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
                    </div>

                    <button type="submit" disabled={isLoading}
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 rounded-full shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide">
                        {isLoading ? 'Processing...' : 'Register'}
                    </button>

                    {successMessage && (
                        <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-4 rounded-xl text-center font-semibold animate-fade-in">
                            {successMessage}
                        </div>
                    )}

                    <div className="text-center mt-6">
                        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm underline decoration-white/20 hover:decoration-white/50">
                            ← Back to Home
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}
