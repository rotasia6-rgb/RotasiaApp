"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Nomination } from "@/types/voting";
import { Plus, Trash2, Trophy } from "lucide-react";

export default function VotingAdminPage() {
    const [nominations, setNominations] = useState<Nomination[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");

    const fetchNominations = async () => {
        const { data, error } = await supabase
            .from('nominations')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setNominations(data as Nomination[]);
    };

    useEffect(() => {
        fetchNominations();
    }, []);

    const addContestant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setIsAdding(true);

        const { error } = await supabase
            .from('nominations')
            .insert([{ contestant_name: newName, category: 'outfit' }]);

        if (!error) {
            setNewName("");
            fetchNominations();
        }
        setIsAdding(false);
    };

    const deleteContestant = async (id: string) => {
        if (!confirm('Are you sure?')) return;

        const { error } = await supabase.from('nominations').delete().eq('id', id);
        if (!error) {
            setNominations(prev => prev.filter(n => n.id !== id));
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Voting Manager</h1>
                    <p className="text-gray-500 mt-1">Manage Best Outfit Contestants</p>
                </div>
                <a href="/voting" target="_blank" className="text-blue-600 hover:text-blue-800 font-medium">View Public Page</a>
            </div>

            {/* Add New */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <form onSubmit={addContestant} className="flex gap-4">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter contestant name..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Contestant
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Rank</th>
                            <th className="px-6 py-4 font-semibold">Name</th>
                            <th className="px-6 py-4 font-semibold text-center">Votes</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {nominations
                            .sort((a, b) => b.votes - a.votes)
                            .map((item, idx) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        {idx === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                                        {idx > 0 && <span className="text-gray-400 font-mono">#{idx + 1}</span>}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.contestant_name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-bold">
                                            {item.votes}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => deleteContestant(item.id)}
                                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                {nominations.length === 0 && (
                    <div className="p-8 text-center text-gray-400">No contestants added yet.</div>
                )}
            </div>
        </div>
    );
}
