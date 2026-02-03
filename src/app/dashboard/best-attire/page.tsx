"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Nomination } from "@/types/voting";
import { Search, CheckCircle, XCircle, Clock, Image as ImageIcon } from "lucide-react";

// Helper to transform Google Drive URLs to direct image links
// Helper to transform Google Drive URLs to direct image links
const getOptimizedImageUrl = (url: string | null) => {
    if (!url) return '';

    // Handle Google Drive URLs
    if (url.includes('drive.google.com')) {
        // Extract ID
        const idMatch = url.match(/[-\w]{25,}/);
        if (idMatch) {
            return `https://lh3.googleusercontent.com/d/${idMatch[0]}`;
        }
    }

    return url;
};

export default function BestAttireManagementPage() {
    const [entries, setEntries] = useState<Nomination[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const fetchEntries = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('nominations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEntries((data as Nomination[]) || []);
        } catch (error) {
            console.error('Error fetching attire entries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
        try {
            // Optimistic update
            setEntries(prev =>
                prev.map(e => e.id === id ? { ...e, status: newStatus } : e)
            );

            const { error } = await supabase
                .from('nominations')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
            fetchEntries(); // Revert on error
        }
    };

    const filteredEntries = entries.filter(e => {
        if (filter === 'all') return true;
        return e.status === filter;
    });

    const pendingCount = entries.filter(e => e.status === 'pending').length;

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Best Attire Management</h1>
                    <p className="text-gray-500 mt-1">Review and manage user submitted photos</p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-200">
                        {pendingCount} Pending
                    </span>
                    <button
                        onClick={fetchEntries}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        Refresh
                    </button>
                    <a href="/best-attire" target="_blank" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                        View Public Page
                    </a>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm mb-6 inline-flex flex-wrap gap-1">
                {(['pending', 'all', 'approved', 'rejected'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                            ? 'bg-blue-100 text-blue-700 shadow-sm'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredEntries.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No entries found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting the filter or wait for new submissions.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEntries.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow group">

                            {/* Image Container */}
                            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                                <img
                                    src={getOptimizedImageUrl(item.contestant_photo || null)}
                                    alt={item.caption || "Best Attire Entry"}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (target.src.includes('lh3.googleusercontent.com') && item.contestant_photo) {
                                            const idMatch = item.contestant_photo.match(/[-\w]{25,}/);
                                            if (idMatch) {
                                                target.src = `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
                                            }
                                        }
                                    }}
                                />
                                <div className="absolute top-2 right-2">
                                    {getStatusBadge(item.status)}
                                </div>
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                                    <h3 className="text-white font-bold truncate">{item.contestant_name}</h3>
                                    {item.caption && <p className="text-gray-200 text-xs truncate opacity-90">{item.caption}</p>}
                                </div>
                            </div>

                            <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                                {item.status === 'pending' || item.status === 'rejected' ? (
                                    <button
                                        onClick={() => updateStatus(item.id, 'approved')}
                                        className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Approve
                                    </button>
                                ) : null}

                                {item.status === 'pending' || item.status === 'approved' ? (
                                    <button
                                        onClick={() => updateStatus(item.id, 'rejected')}
                                        className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function getStatusBadge(status: string) {
    if (status === 'approved') {
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm border border-green-200"><CheckCircle className="w-3 h-3" /> Approved</span>;
    }
    if (status === 'rejected') {
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 shadow-sm border border-red-200"><XCircle className="w-3 h-3" /> Rejected</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 shadow-sm border border-yellow-200"><Clock className="w-3 h-3" /> Pending</span>;
}
