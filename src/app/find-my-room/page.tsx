"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

import { Search, User, MapPin, Home, Users, Hash, Loader2, Phone, Plane, Calendar, Save } from "lucide-react";

interface DelegateDetails {
    // id: string; // Not needed as we use email
    name: string;
    club_name: string;
    district: string;
    room_number: string;
    rotasia_id: string;
    email: string;
    hotel?: string;
}

interface Roommate {
    name: string;
    rotasia_id: string;
    phone?: string;
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
    const [hasSearched, setHasSearched] = useState(false);
    const [coordinator, setCoordinator] = useState<Coordinator | null>(null);

    // Travel Details State
    const [showTravelForm, setShowTravelForm] = useState(false);
    const [travelData, setTravelData] = useState({
        arrival_date: '',
        arrival_time: '',
        arrival_mode: '',
        departure_date: '',
        departure_time: '',
        departure_mode: ''
    });
    const [isSavingTravel, setIsSavingTravel] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) return;

        setIsLoading(true);
        setError(null);
        setMyData(null);
        setRoommates([]);
        setCoordinator(null);
        setShowTravelForm(false);
        setHasSearched(false);

        try {
            // STEP 1: CHECK DELEGATE STATUS FIRST
            const { data: userRecords, error: userError } = await supabase
                .from('delegates')
                .select('*')
                .ilike('email', trimmedEmail);

            if (userError) throw userError;

            if (!userRecords || userRecords.length === 0) {
                // NOT a registered delegate -> Show Error
                setError("This email is not registered as a delegate. Please use your registered email.");
                setIsLoading(false);
                return;
            }

            // Valid Delegate Found
            const me = userRecords[0];

            // STEP 2: CHECK TRAVEL DETAILS (Only for valid delegates)
            const { data: travelRecord, error: travelError } = await supabase
                .from('travel_details')
                .select('*')
                .eq('email', trimmedEmail)
                .single();

            if (!travelRecord) {
                // Delegate exists but NO travel details -> Show Travel Form
                setShowTravelForm(true);
                setIsLoading(false);
                return;
            }

            // STEP 3: SHOW ROOM ALLOCATION (Delegate + Travel exists)
            // Just populate the data to show the dashboard
            const myDetails = {
                name: me.name,
                club_name: me.club_name || "N/A",
                district: me.district || "N/A",
                room_number: me.room_number || "To be assigned",
                rotasia_id: me.rotasia_id || me.id.substring(0, 8).toUpperCase(),
                email: me.email,
                hotel: me.hotel || "TBD"
            };
            setMyData(myDetails);
            setHasSearched(true);

            // Fetch Roommates & Coordinator if room assigned
            if (me.room_number && me.room_number !== "To be assigned") {
                // Roommates
                const { data: roomRecords } = await supabase
                    .from('delegates')
                    .select('name, rotasia_id, phone')
                    .eq('room_number', me.room_number)
                    .neq('email', trimmedEmail);

                if (roomRecords) {
                    setRoommates(roomRecords.map(r => ({
                        name: r.name,
                        rotasia_id: r.rotasia_id || "N/A",
                        phone: r.phone
                    })));
                }

                // Coordinator
                const { data: coordData } = await supabase
                    .from('room_coordinators')
                    .select('name, phone')
                    .eq('room_number', me.room_number)
                    .single();

                if (coordData) setCoordinator(coordData);
            }

        } catch (err: any) {
            console.error(err);
            setError("Something went wrong. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper removed as logic is now inline or simplified
    const fetchDelegateDetails = async (userEmail: string) => {
        // Kept for compatibility if called elsewhere, or can be removed if unused.
        // For this refactor, we incorporated the logic into handleSearch directly for clarity of flow.
        return;
    };

    const handleTravelSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) return;

        setIsSavingTravel(true);
        try {
            // Combine date and time for DB
            const finalArrival = `${travelData.arrival_date}T${travelData.arrival_time}`;
            const finalDeparture = `${travelData.departure_date}T${travelData.departure_time}`;

            const { error } = await supabase
                .from('travel_details')
                .insert({
                    email: trimmedEmail,
                    arrival_date: finalArrival,
                    arrival_mode: travelData.arrival_mode,
                    departure_date: finalDeparture,
                    departure_mode: travelData.departure_mode
                });

            if (error) throw error;

            // Success! Hide form and proceed to check room/delegate info
            setShowTravelForm(false);
            // Re-run the room fetching logic manually or recursively call handleSearch if possible (but e is needed)
            // For simplicity, we can just reload the page or better: manually fetch the data again here.
            // Since we know they are a delegate (checked in step 1), we can just fetch and show.

            // Re-fetch delegate details
            const { data: userRecords } = await supabase
                .from('delegates')
                .select('*')
                .ilike('email', trimmedEmail);

            if (userRecords && userRecords.length > 0) {
                const me = userRecords[0];
                const myDetails = {
                    name: me.name,
                    club_name: me.club_name || "N/A",
                    district: me.district || "N/A",
                    room_number: me.room_number || "To be assigned",
                    rotasia_id: me.rotasia_id || me.id.substring(0, 8).toUpperCase(),
                    email: me.email,
                    hotel: me.hotel || "TBD"
                };
                setMyData(myDetails);
                setHasSearched(true);

                // Fetch Roommates & Coordinator if room assigned
                if (me.room_number && me.room_number !== "To be assigned") {
                    // Roommates
                    const { data: roomRecords } = await supabase
                        .from('delegates')
                        .select('name, rotasia_id, phone')
                        .eq('room_number', me.room_number)
                        .neq('email', trimmedEmail);

                    if (roomRecords) {
                        setRoommates(roomRecords.map(r => ({
                            name: r.name,
                            rotasia_id: r.rotasia_id || "N/A",
                            phone: r.phone
                        })));
                    }

                    // Coordinator
                    const { data: coordData } = await supabase
                        .from('room_coordinators')
                        .select('name, phone')
                        .eq('room_number', me.room_number)
                        .single();

                    if (coordData) setCoordinator(coordData);
                }
            }

        } catch (err) {
            console.error("Error saving travel details:", err);
            setError("Failed to save travel details. Please try again.");
        } finally {
            setIsSavingTravel(false);
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
                    {/* Always show search form unless we have successful data to display OR are showing the travel form */}
                    {(!myData && !showTravelForm && !roommates.length && !error) && (
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
                    )}

                    {/* Result: Room Not Allotted / Not Found */}
                    {(!isLoading && !showTravelForm && !myData && !error && hasSearched && !isLoading) && (
                        <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-orange-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Home className="w-8 h-8 text-orange-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Room Not Allotted</h2>
                            <p className="text-gray-400 mb-6">
                                We have received your travel details, but no room allocation was found for <span className="text-white font-mono">{email}</span>.
                            </p>
                            <button
                                onClick={() => {
                                    setMyData(null);
                                    setEmail('');
                                    setError(null);
                                    setHasSearched(false);
                                }}
                                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl transition-colors"
                            >
                                Check another ID
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-center mb-4 text-sm animate-in fade-in slide-in-from-top-2">
                            {error}
                            <button
                                onClick={() => setError(null)}
                                className="block w-full mt-2 text-xs text-red-300 hover:text-white underline"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {showTravelForm && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-white mb-1">Welcome!</h2>
                                <p className="text-sm text-gray-300">Please provide your travel details to view your room allocation.</p>
                            </div>

                            <form onSubmit={handleTravelSubmit} className="space-y-4">
                                {/* Arrival */}
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-2 mb-3 text-blue-300 font-medium">
                                        <Plane className="w-4 h-4" /> Arrival Details
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-400 mb-1">Date</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={travelData.arrival_date}
                                                    onChange={(e) => setTravelData({ ...travelData, arrival_date: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-400 mb-1">Time</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={travelData.arrival_time}
                                                    onChange={(e) => setTravelData({ ...travelData, arrival_time: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Mode of Transport</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Flight, Train, Bus..."
                                                required
                                                value={travelData.arrival_mode}
                                                onChange={(e) => setTravelData({ ...travelData, arrival_mode: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-600"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Departure */}
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-2 mb-3 text-purple-300 font-medium">
                                        <Calendar className="w-4 h-4" /> Departure Details
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-400 mb-1">Date</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={travelData.departure_date}
                                                    onChange={(e) => setTravelData({ ...travelData, departure_date: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-400 mb-1">Time</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={travelData.departure_time}
                                                    onChange={(e) => setTravelData({ ...travelData, departure_time: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Mode of Transport</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Flight, Train, Bus..."
                                                required
                                                value={travelData.departure_mode}
                                                onChange={(e) => setTravelData({ ...travelData, departure_mode: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none placeholder-gray-600"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSavingTravel}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSavingTravel ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Save & View Room
                                </button>
                            </form>
                        </div>
                    )}

                    {myData && !showTravelForm && (
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
                                            {myData.hotel && (
                                                <span className="text-sm text-purple-200 block mt-1 font-medium">{myData.hotel}</span>
                                            )}
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

                            <div className="text-center pt-4">
                                <button
                                    onClick={() => {
                                        setMyData(null);
                                        setEmail('');
                                    }}
                                    className="text-gray-500 hover:text-white text-sm underline"
                                >
                                    Check another ID
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

