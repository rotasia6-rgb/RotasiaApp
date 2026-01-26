'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-heading' });

// Configuration
const FORM_SUPABASE_URL = process.env.NEXT_PUBLIC_ROTASIA_FORM_URL || 'https://cokrhsjbkkhrrimrzmgy.supabase.co';
const FORM_SUPABASE_KEY = process.env.NEXT_PUBLIC_ROTASIA_FORM_KEY || 'sb_publishable_w5KN2D0Zy1-g3AeoDP6icQ_zfekGSLS';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyImFNGdjEl9s08PAczr4LFRQVHAUXPn9F8N0AkB1gbCdp9sAg7oyOvSQAh_vwdTgJa/exec';

// Initialize Supabase for this specific form
const supabase = createClient(FORM_SUPABASE_URL, FORM_SUPABASE_KEY);

export default function MrMsRotasiaPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        } else {
            setFileName(null);
        }
    };

    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]); // Remove data:image/...;base64,
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMessage(null);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
        const file = fileInput?.files?.[0];

        try {
            let photoUrl = '';

            // 1. Upload to Google Drive via Apps Script
            if (file) {
                const base64File = await getBase64(file);

                const payload = {
                    file: base64File,
                    filename: `${Date.now()}_${file.name}`,
                    mimeType: file.type
                };

                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8",
                    },
                });

                const result = await response.json();

                if (result.status === 'success') {
                    photoUrl = result.fileUrl;
                    console.log('File uploaded to Drive:', photoUrl);
                } else {
                    throw new Error('Google Drive upload failed: ' + result.message);
                }
            }

            // 2. Submit Data to Supabase
            const { data, error } = await supabase
                .from('registrations')
                .insert([
                    {
                        full_name: formData.get('fullName'),
                        gender: formData.get('gender'),
                        dob: formData.get('dob'),
                        club_name: formData.get('clubName'),
                        district: formData.get('district'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        instagram: formData.get('instagram'),
                        photo_url: photoUrl,
                        bio: formData.get('bio')
                    }
                ]);

            if (error) throw error;

            console.log('Supabase Insert Success:', data);
            setSuccessMessage('Registration Successful! Thank you for registering for Mr. & Ms. Rotasia.');

            form.reset();
            setFileName(null);

            // Remove message after 5 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);

        } catch (error: any) {
            console.error('Error submitting form:', error);
            alert('An error occurred during registration. Please try again. \nDebug: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

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
                    <p className="text-gray-300 text-lg">Register to be the face of Rotasia Chennai 2026</p>
                </div>

                <form id="rotasiaForm" onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                        <input type="text" id="fullName" name="fullName" placeholder="Enter your full name" required
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                            <select id="gender" name="gender" required defaultValue=""
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none cursor-pointer">
                                <option value="" disabled className="bg-gray-900">Select gender</option>
                                <option value="male" className="bg-gray-900">Male</option>
                                <option value="female" className="bg-gray-900">Female</option>
                                <option value="other" className="bg-gray-900">Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                            <input type="date" id="dob" name="dob" required
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="clubName" className="block text-sm font-medium text-gray-300 mb-2">Rotaract Club Name</label>
                        <input type="text" id="clubName" name="clubName" placeholder="e.g. RAC xxx" required
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                    </div>

                    <div>
                        <label htmlFor="district" className="block text-sm font-medium text-gray-300 mb-2">Rotary International District</label>
                        <input type="text" id="district" name="district" placeholder="e.g. District xxx" required
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                            <input type="email" id="email" name="email" placeholder="yourname@example.com" required
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">WhatsApp Number</label>
                            <input type="tel" id="phone" name="phone" placeholder="+91 98765 43210" required
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="instagram" className="block text-sm font-medium text-gray-300 mb-2">Instagram Handle</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                            <input type="text" id="instagram" name="instagram" placeholder="username"
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="photo" className="block text-sm font-medium text-gray-300 mb-2">Upload Your Photo (Portfolio Shot)</label>
                        <div className="relative group cursor-pointer">
                            <input
                                type="file"
                                id="photo"
                                name="photo"
                                accept="image/*"
                                required
                                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                onChange={handleFileChange}
                            />
                            <div className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${fileName ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 hover:border-white/40 bg-white/5'}`}>
                                <div className="text-3xl mb-2">📁</div>
                                <p className="text-sm text-gray-400 text-center px-4 truncate w-full">
                                    {fileName ? fileName : 'Click to upload or drag & drop'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">Why do you want to participate?</label>
                        <textarea id="bio" name="bio" rows={4}
                            placeholder="Tell us about yourself in a few words..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"></textarea>
                    </div>

                    <button type="submit" disabled={isLoading}
                        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 rounded-full shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide">
                        {isLoading ? 'Processing...' : 'Register Now'}
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

            <footer className="mt-12 text-gray-500 text-sm relative z-10">
                <p>© 2026 Rotasia Chennai. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
