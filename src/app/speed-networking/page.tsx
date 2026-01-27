'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-heading' });

// Configuration
const FORM_SUPABASE_URL = process.env.NEXT_PUBLIC_ROTASIA_FORM_URL || 'https://cokrhsjbkkhrrimrzmgy.supabase.co';
const FORM_SUPABASE_KEY = process.env.NEXT_PUBLIC_ROTASIA_FORM_KEY || 'sb_publishable_w5KN2D0Zy1-g3AeoDP6icQ_zfekGSLS';

const supabase = createClient(FORM_SUPABASE_URL, FORM_SUPABASE_KEY);

// ... imports remain the same

export default function SpeedNetworkingPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMessage(null);

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const payload = {
                full_name: formData.get('fullName'),
                club_name: formData.get('clubName'),
                district: formData.get('district'),
                phone: formData.get('phone'),
                linkedin: formData.get('linkedin'),
                profession: formData.get('profession'),
                interests: formData.get('interests')
            };

            const { error } = await supabase
                .from('speed_networking_registrations')
                .insert([payload]);

            if (error) throw error;

            setSuccessMessage('Registered Successfully! Get ready to network.');
            form.reset();
            setTimeout(() => setSuccessMessage(null), 5000);

        } catch (error: any) {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen bg-[#0B0B1C] text-white ${inter.variable} ${plusJakarta.variable}`} style={{ fontFamily: 'var(--font-body)' }}>

            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[30%] w-[50%] h-[50%] bg-cyan-600 rounded-full blur-[150px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[150px] opacity-20 animate-pulse delay-1000"></div>
            </div>

            <div className="container mx-auto px-4 py-12 relative z-10">

                {/* Hero Section */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-4xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-6 font-heading">
                        Where Talent Meets Opportunity
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                        A dynamic networking platform bringing together students, aspirants, freelancers, professionals, and business owners to create real career and business opportunities.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">

                    {/* Left Column: Info */}
                    <div className="space-y-8 animate-fade-in-left">

                        {/* Why Attend */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8 hover:bg-white/10 transition-colors">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-cyan-400 font-heading">🎯 Why Attend?</h2>
                            <ul className="space-y-4 text-gray-200">
                                <li className="flex items-start gap-3">
                                    <span className="text-cyan-400 mt-1">✔</span>
                                    <span>Students discover internships, mentorships, and career pathways</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-cyan-400 mt-1">✔</span>
                                    <span>Freelancers connect with live projects and long-term clients</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-cyan-400 mt-1">✔</span>
                                    <span>Business owners find partners, skilled manpower, and collaborators</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-cyan-400 mt-1">✔</span>
                                    <span>Aspirants gain clarity on career opportunities and industry exposure</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-cyan-400 mt-1">✔</span>
                                    <span>Build visibility and meaningful connections that lead to action</span>
                                </li>
                            </ul>
                        </div>

                        {/* Event Details */}
                        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-white/10 rounded-3xl p-6 md:p-8">
                            <h3 className="text-2xl font-bold mb-6 text-white font-heading">Event Details</h3>
                            <div className="space-y-4 text-lg">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📅</span>
                                    <span><span className="font-semibold text-cyan-300">Date:</span> Feb 6 & Feb 7</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">⏰</span>
                                    <span><span className="font-semibold text-cyan-300">Time:</span> 9:00 AM – 10:00 AM</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">⏳</span>
                                    <span><span className="font-semibold text-red-400">Last Date to Register:</span> Jan 31st</span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                                <span className="text-yellow-400 text-xl">👉</span>
                                <p className="text-yellow-200 text-sm md:text-base">
                                    If possible, please carry your business cards for effective networking.
                                </p>
                            </div>

                            <div className="mt-6">
                                <span className="inline-flex items-center px-4 py-2 bg-red-500/20 text-red-300 rounded-full text-sm font-semibold border border-red-500/30 animate-pulse">
                                    Limited slots available
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Form */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl animate-fade-in-right sticky top-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-white font-heading">Register Now</h2>
                            <p className="text-gray-400 mt-2">Secure your spot for the speed networking session</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                    <input type="text" name="fullName" required placeholder="Your Name"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Club Name</label>
                                    <input type="text" name="clubName" required placeholder="e.g. RAC Chennai"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">RI District</label>
                                    <input type="text" name="district" required placeholder="e.g. 3232"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
                                    <input type="tel" name="phone" required placeholder="+91 9876543210"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn Profile (Optional)</label>
                                <input type="url" name="linkedin" placeholder="https://linkedin.com/in/..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Profession / Field of Study</label>
                                <input type="text" name="profession" required placeholder="e.g. Software Engineer / Student"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Areas of Interest for Networking</label>
                                <textarea name="interests" rows={3} required placeholder="e.g. Tech, Social Service, Entrepreneurship..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-500"></textarea>
                            </div>

                            <button type="submit" disabled={isLoading}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-full shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide mt-2">
                                {isLoading ? 'Processing...' : 'Register for Speed Networking'}
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
            </div>
        </div>
    );
}
