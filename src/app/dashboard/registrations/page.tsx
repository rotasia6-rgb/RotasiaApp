'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { ArrowLeft, Download, FileText, Users, Mic, Lightbulb, Handshake } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-heading' });

// Configuration
const FORM_SUPABASE_URL = process.env.NEXT_PUBLIC_ROTASIA_FORM_URL || 'https://cokrhsjbkkhrrimrzmgy.supabase.co';
const FORM_SUPABASE_KEY = process.env.NEXT_PUBLIC_ROTASIA_FORM_KEY || 'sb_publishable_w5KN2D0Zy1-g3AeoDP6icQ_zfekGSLS';

const supabase = createClient(FORM_SUPABASE_URL, FORM_SUPABASE_KEY);

type EventType = 'mr-ms-rotasia' | 'open-mic' | 'idea' | 'speed-networking';

const EVENTS: { id: EventType; name: string; table: string; icon: any }[] = [
    { id: 'mr-ms-rotasia', name: 'Mr. & Ms. Rotasia', table: 'registrations', icon: Users },
    { id: 'open-mic', name: 'Open Mic', table: 'open_mic_registrations', icon: Mic },
    { id: 'idea', name: 'My Idea for Rotaract', table: 'idea_submissions', icon: Lightbulb },
    { id: 'speed-networking', name: 'Speed Networking', table: 'speed_networking_registrations', icon: Handshake },
];

export default function RegistrationsPage() {
    const [activeTab, setActiveTab] = useState<EventType>('mr-ms-rotasia');
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const match = document.cookie.match(new RegExp('(^| )current_user=([^;]+)'));
            if (match) {
                setCurrentUser(match[2]);
            }
        }
    }, []);

    useEffect(() => {
        if (currentUser === 'Kumar') {
            fetchData(activeTab);
        }
    }, [activeTab, currentUser]);

    const fetchData = async (eventId: EventType) => {
        setIsLoading(true);
        setError(null);
        setData([]);

        const event = EVENTS.find(e => e.id === eventId);
        if (!event) return;

        try {
            const { data: result, error: fetchError } = await supabase
                .from(event.table)
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setData(result || []);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadCSV = () => {
        if (data.length === 0) return;

        const event = EVENTS.find(e => e.id === activeTab);
        const fileName = `${event?.name.replace(/ /g, '_')}_Registrations.csv`;

        // 1. Get Headers
        // We'll filter out internal fields to make the sheet cleaner, 
        // but keep everything else dynamically.
        if (data.length === 0) return;
        const headers = Object.keys(data[0]).filter(k =>
            !['file_url', 'photo_url'].includes(k)
        );

        // 2. Convert Data to CSV String
        const csvRows = [];

        // Add Header Row
        csvRows.push(headers.join(','));

        // Add Data Rows
        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header];
                // Escape values that contain commas, quotes, or newlines
                const escaped = ('' + (val ?? '')).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');

        // 3. Create Blob and Trigger Download
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (currentUser !== 'Kumar') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
                    <Link href="/dashboard" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const ActiveIcon = EVENTS.find(e => e.id === activeTab)?.icon || FileText;

    return (
        <div className={`min-h-screen bg-gray-50 ${inter.variable} ${plusJakarta.variable}`} style={{ fontFamily: 'var(--font-body)' }}>
            <div className="container mx-auto px-4 py-8 max-w-7xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-gray-900">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-heading">Event Registrations</h1>
                            <p className="text-gray-500">Manage and export registration details</p>
                        </div>
                    </div>

                    {data.length > 0 && (
                        <button
                            onClick={downloadCSV}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl shadow-sm hover:bg-green-700 hover:shadow-md transition-all active:scale-95 font-medium"
                        >
                            <Download size={18} />
                            Download CSV
                        </button>
                    )}
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    {EVENTS.map((event) => {
                        const Icon = event.icon;
                        const isActive = activeTab === event.id;
                        return (
                            <button
                                key={event.id}
                                onClick={() => setActiveTab(event.id)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-medium text-sm md:text-base flex-1 md:flex-none justify-center ${isActive
                                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={18} />
                                {event.name}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">

                    {/* Toolbar */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-700 font-semibold">
                            <ActiveIcon size={20} className="text-gray-400" />
                            <span>{data.length} Records Found</span>
                        </div>
                        {isLoading && <span className="text-sm text-blue-500 animate-pulse">Syncing...</span>}
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                                <div className="p-3 bg-red-50 rounded-full text-red-500 mb-3">!</div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1">Failed to Load Data</h3>
                                <p className="text-gray-500 max-w-md">{error}</p>
                                <button
                                    onClick={() => fetchData(activeTab)}
                                    className="mt-4 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-gray-400">
                                <div className="p-4 bg-gray-50 rounded-full mb-3">
                                    <FileText size={32} className="opacity-20" />
                                </div>
                                <p>No registrations found for this event yet.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100">
                                        <th className="p-4 pl-6">#</th>
                                        <th className="p-4">Date</th>
                                        {/* Dynamic Headers based on first record keys */}
                                        {Object.keys(data[0])
                                            .filter(k => !['id', 'created_at', 'updated_at', 'file_url', 'photo_url'].includes(k))
                                            .slice(0, 5) // Limit to 5 columns for view
                                            .map(key => (
                                                <th key={key} className="p-4">{key.replace(/_/g, ' ')}</th>
                                            ))
                                        }
                                        <th className="p-4 text-right pr-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
                                    {data.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="p-4 pl-6 font-mono text-xs text-gray-400">{index + 1}</td>
                                            <td className="p-4 whitespace-nowrap">
                                                {row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}
                                                {row.created_at && <span className="text-xs text-gray-400 block">{new Date(row.created_at).toLocaleTimeString()}</span>}
                                            </td>

                                            {Object.keys(data[0])
                                                .filter(k => !['id', 'created_at', 'updated_at', 'file_url', 'photo_url'].includes(k))
                                                .slice(0, 5)
                                                .map(key => (
                                                    <td key={key} className="p-4 max-w-[200px] truncate" title={String(row[key])}>
                                                        {String(row[key])}
                                                    </td>
                                                ))
                                            }

                                            <td className="p-4 text-right pr-6">
                                                {(row.file_url || row.photo_url) ? (
                                                    <a
                                                        href={row.file_url || row.photo_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-xs bg-blue-50 px-2 py-1 rounded-md"
                                                    >
                                                        View File
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
