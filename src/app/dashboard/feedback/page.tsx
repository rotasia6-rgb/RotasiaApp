"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Feedback } from "@/types/feedback";
import { Search, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

export default function FeedbackManagementPage() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const fetchFeedbacks = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('feedback')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFeedbacks((data as Feedback[]) || []);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
        try {
            // Optimistic update
            setFeedbacks(prev =>
                prev.map(f => f.id === id ? { ...f, status: newStatus } : f)
            );

            const { error } = await supabase
                .from('feedback')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
            fetchFeedbacks(); // Revert on error
        }
    };

    const filteredFeedbacks = feedbacks.filter(f => {
        if (filter === 'all') return true;
        return f.status === filter;
    });

    const pendingCount = feedbacks.filter(f => f.status === 'pending').length;

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Feedback Management</h1>
                    <p className="text-gray-500 mt-1">Review and manage user submitted feedback</p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-200">
                        {pendingCount} Pending
                    </span>
                    <button
                        onClick={fetchFeedbacks}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        Refresh
                    </button>
                    <a href="/feedback/wall" target="_blank" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                        View Wall
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
            ) : filteredFeedbacks.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                        <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No feedbacks found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting the filter or wait for new submissions.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFeedbacks.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                            {item.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                                            <p className="text-xs text-gray-400">
                                                {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    {getStatusBadge(item.status)}
                                </div>

                                <blockquote className="text-gray-700 italic border-l-2 border-blue-100 pl-3 py-1 text-sm bg-gray-50/50 rounded-r-lg">
                                    "{item.message}"
                                </blockquote>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
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
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Approved</span>;
    }
    if (status === 'rejected') {
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Rejected</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Pending</span>;
}
