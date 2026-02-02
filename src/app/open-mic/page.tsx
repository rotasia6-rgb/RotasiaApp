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

                <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-8 rounded-2xl text-center backdrop-blur-md">
                    <div className="text-4xl mb-4">🚫</div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">Registrations Closed</h2>
                    <p className="text-gray-300 text-lg">
                        Thank you for your overwhelming response! <br />
                        The registration application period for Open Mic Contest has officially ended.
                    </p>
                    <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-sm text-gray-400">
                            Updates on the schedule will be announced soon. Stay tuned.
                        </p>
                    </div>
                </div>

                <div className="text-center mt-10">
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all text-sm font-medium border border-white/10">
                        <span>←</span> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
