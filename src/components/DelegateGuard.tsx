'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DelegateGuard({ children }: { children: React.ReactNode }) {
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const router = useRouter();

    useEffect(() => {
        // Check localStorage for prior verification
        const savedEmail = localStorage.getItem('delegate_email');
        if (savedEmail) {
            setIsVerified(true);
        }
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const supabase = createClient();

            // Check in registrations table (Mr Ms Rotasia) OR delegates table (Admin sync). 
            // We check 'delegates' first as it is the source of truth for the app usually.

            // 1. Check Delegates Table
            const { data: delegate, error: dError } = await supabase
                .from('delegates')
                .select('*')
                .eq('email', email)
                .single();

            if (delegate) {
                localStorage.setItem('delegate_email', email);
                setIsVerified(true);
                return;
            }

            // 2. Fallback: Check Registrations Table (if used)
            const { data: registration, error: rError } = await supabase
                .from('registrations')
                .select('*')
                .eq('email', email)
                .single();

            if (registration) {
                localStorage.setItem('delegate_email', email);
                setIsVerified(true);
                return;
            }

            setError('Email not found. Please use the email you registered with.');

        } catch (err) {
            console.error(err);
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isVerified) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[#0B0B1C] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Delegate Access</h2>
                    <p className="text-gray-400 text-sm">Please verify your registered email to access this page.</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your registered email"
                            required
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Access Content'}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="w-full text-gray-500 text-sm hover:text-white mt-2"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
