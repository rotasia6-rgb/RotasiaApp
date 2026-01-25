"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Nomination } from "@/types/voting";
import { Plus, Trash2, Trophy, Upload, User, Image as ImageIcon } from "lucide-react";

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyImFNGdjEl9s08PAczr4LFRQVHAUXPn9F8N0AkB1gbCdp9sAg7oyOvSQAh_vwdTgJa/exec';

export default function VotingAdminPage() {
    const [nominations, setNominations] = useState<Nomination[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>("");

    const fetchNominations = async () => {
        const { data, error } = await supabase
            .from('nominations')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setNominations(data as Nomination[]);
    };

    const getOptimizedImageUrl = (url: string) => {
        if (!url) return '';
        if (url.includes('drive.google.com')) {
            const idMatch = url.match(/[-\w]{25,}/);
            if (idMatch) return `https://lh3.googleusercontent.com/d/${idMatch[0]}`;
        }
        return url;
    };

    useEffect(() => {
        fetchNominations();
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setFileName(e.target.files[0].name);
        }
    };

    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const addContestant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setIsAdding(true);

        try {
            let photoUrl = "";

            if (file) {
                const base64File = await getBase64(file);
                const payload = {
                    file: base64File,
                    filename: `${gender.toUpperCase()}_${Date.now()}_${file.name}`, // Prefix for potential sorting
                    mimeType: file.type
                };

                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                });

                const result = await response.json();
                if (result.status === 'success') {
                    photoUrl = result.fileUrl;
                } else {
                    throw new Error('Image upload failed');
                }
            }

            const { error } = await supabase
                .from('nominations')
                .insert([{
                    contestant_name: newName,
                    category: 'outfit',
                    gender: gender,
                    contestant_photo: photoUrl
                }]);

            if (!error) {
                setNewName("");
                setFile(null);
                setFileName("");
                setGender('male');
                fetchNominations();
            } else {
                alert("Failed to save contestant: " + error.message);
            }
        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setIsAdding(false);
        }
    };

    const deleteContestant = async (id: string) => {
        if (!confirm('Are you sure?')) return;

        const { error } = await supabase.from('nominations').delete().eq('id', id);
        if (!error) {
            setNominations(prev => prev.filter(n => n.id !== id));
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Voting Manager</h1>
                    <p className="text-gray-500 mt-1">Manage Best Outfit Contestants</p>
                </div>
                <a href="/voting" target="_blank" className="text-blue-600 hover:text-blue-800 font-medium">View Public Page</a>
            </div>

            {/* Add New */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Add New Contestant</h3>
                <form onSubmit={addContestant} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                    {/* Name */}
                    <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Contestant Name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Gender */}
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    {/* Photo Upload */}
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="photo-upload"
                            />
                            <label
                                htmlFor="photo-upload"
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm text-gray-600 truncate"
                            >
                                <Upload className="w-4 h-4" />
                                {fileName ? fileName : "Upload Photo"}
                            </label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={isAdding}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isAdding ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" /> Add
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Rank</th>
                            <th className="px-6 py-4 font-semibold">Contestant</th>
                            <th className="px-6 py-4 font-semibold">Gender</th>
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
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {item.contestant_photo ? (
                                                <img
                                                    src={getOptimizedImageUrl(item.contestant_photo)}
                                                    alt={item.contestant_name}
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            )}
                                            <span className="font-medium text-gray-900">{item.contestant_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${item.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {item.gender || 'Unknown'}
                                        </span>
                                    </td>
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
