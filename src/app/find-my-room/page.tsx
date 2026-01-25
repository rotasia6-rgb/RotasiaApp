"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, User, MapPin, Home, Users, Hash, Loader2, Phone } from "lucide-react";

interface DelegateDetails {
    name: string;
    club_name: string;
    district: string;
    room_number: string;
    rotasia_id: string;
    email: string;
}

interface Coordinator {
    name: string;
    phone: string;
}

export default function RoomLookupPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [myData, setMyData] = useState<DelegateDetails | null>(null);
    const [roommates, setRoommates] = useState<Roommate[]>([]);
    const [coordinator, setCoordinator] = useState<Coordinator | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsLoading(true);
        setError(null);
        setMyData(null);
        setRoommates([]);
        setCoordinator(null);

        try {
            // 1. Find the user by Email
            const { data: userRecords, error: userError } = await supabase
                .from('delegates')
                .select('*')
                .ilike('email', email.trim());

            if (userError) throw userError;

            if (!userRecords || userRecords.length === 0) {
                setError("No registration found with this email. Please check and try again.");
                return;
            }

            const me = userRecords[0];
            setMyData({
                name: me.name,
                club_name: me.club_name || "N/A",
                district: me.district || "N/A",
                room_number: me.room_number || "To be assigned",
                rotasia_id: me.rotasia_id || me.id.substring(0, 8).toUpperCase(),
                email: me.email
            });

            // 2. If room assigned, find roommates and coordinator
            if (me.room_number) {
                // Fetch Roommates
                const { data: roomRecords, error: roomError } = await supabase
                    .from('delegates')
                    .select('name, rotasia_id, phone')
                    .eq('room_number', me.room_number)
                    .neq('email', email.trim());

                if (roomError) throw roomError;

                if (roomRecords) {
                    setRoommates(roomRecords.map(r => ({
                        name: r.name,
                        rotasia_id: r.rotasia_id || "N/A",
                        phone: r.phone
                    })));
                }

                // Fetch Coordinator
                const { data: coordData, error: coordError } = await supabase
                    .from('room_coordinators')
                    .select('name, phone')
                    .eq('room_number', me.room_number)
                    .single();

                if (!coordError && coordData) {
                    setCoordinator(coordData);
                }
            }

        } catch (err: any) {
            console.error(err);
            setError("Something went wrong. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B1C] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[30%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
                <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-purple-600 rounded-full blur-[120px] opacity-20"></div>
            </div>

            <main className="w-full max-w-lg z-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white mb-2">Find My Room</h1>
                    <p className="text-gray-400">Enter your registered email to get details</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
                    <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                        <input
                            type="email"
                            placeholder="Enter your email address..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                        </button>
                    </form>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-center mb-4 text-sm animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {myData && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Personal Info Card */}
                            <div className="bg-gradient-to-br from-white/10 to-transparent p-5 rounded-2xl border border-white/10">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{myData.name}</h2>
                                        <div className="flex items-center gap-2 text-blue-300 text-sm mt-1">
                                            <Hash className="w-3 h-3" />
                                            <span>ID: {myData.rotasia_id}</span>
                                        </div>
                                    </div>
                                    <div className="bg-blue-600/20 p-2 rounded-full">
                                        <User className="w-6 h-6 text-blue-400" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Home className="w-5 h-5 text-gray-500" />
                                        <span>{myData.club_name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <MapPin className="w-5 h-5 text-gray-500" />
                                        <span>{myData.district}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Coordinator Info */}
                            {coordinator && (
                                <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-5 rounded-2xl border border-blue-500/30">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-500/20 rounded-full">
                                            <User className="w-5 h-5 text-blue-300" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Room Coordinator</h3>
                                            <p className="text-xs text-blue-300">Contact for assistance</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                                        <span className="text-white font-medium">{coordinator.name}</span>
                                        <a href={`tel:${coordinator.phone}`} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg transition-colors font-bold">
                                            <Phone className="w-3 h-3" />
                                            Call
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Room Info - Spotlighted */}
                            <div className="bg-gradient-to-br from-[#6D28D9] to-[#4C1D95] p-6 rounded-2xl border border-purple-400/30 shadow-[0_0_40px_rgba(109,40,217,0.4)] relative overflow-hidden group">
                                {/* Decorative Glow */}
                                <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-white/5 rotate-45 pointer-events-none group-hover:rotate-90 transition-transform duration-1000"></div>

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex items-center gap-2 text-purple-100">
                                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                            <Home className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-lg block leading-none">Room Allocation</span>
                                            <span className="text-xs text-purple-300 uppercase tracking-widest">Confirmed</span>
                                        </div>
                                    </div>
                                    <span className="text-5xl font-black text-white tracking-tight drop-shadow-md">{myData.room_number}</span>
                                </div>

                                {roommates.length > 0 ? (
                                    <div className="relative z-10 bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                                        <p className="text-purple-200 text-xs uppercase font-bold tracking-wider mb-3 flex items-center gap-2">
                                            <Users className="w-3 h-3" />
                                            Roommates
                                        </p>
                                        <ul className="space-y-3">
                                            {roommates.map((rm, idx) => (
                                                <li key={idx} className="flex items-center justify-between gap-3 text-white border-b border-white/10 last:border-0 pb-2 last:pb-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold border border-white/10">
                                                            {rm.name.charAt(0)}
                                                        </div>
                                                        <p className="font-medium text-sm">{rm.name}</p>
                                                    </div>

                                                    {rm.phone && (
                                                        <a href={`tel:${rm.phone}`} className="flex items-center gap-1.5 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full hover:bg-green-500/30 transition-colors border border-green-500/20">
                                                            <Phone className="w-3 h-3" />
                                                            <span>Call</span>
                                                        </a>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="text-purple-200/60 text-sm italic text-center py-4 relative z-10">
                                        No roommates assigned yet or single occupancy.
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
