"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Send, Star, CheckCircle, Loader2 } from "lucide-react";


// Configuration for Dropdowns
const EVENT_DAYS = [
    { label: "Day 1 (Feb 6)", value: "Feb 6" },
    { label: "Day 2 (Feb 7)", value: "Feb 7" },
    { label: "Day 3 (Feb 8)", value: "Feb 8" }
];

const MEAL_TYPES = [
    { label: "Breakfast", value: "Breakfast" },
    { label: "Lunch", value: "Lunch" },
    { label: "Dinner", value: "Dinner" }
];

export default function FoodFeedbackPage() {
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedMeal, setSelectedMeal] = useState("");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDay || !selectedMeal || rating === 0) {
            alert("Please select Day, Meal, and a Rating.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('food_feedback')
                .insert([
                    {
                        day: selectedDay,
                        meal_type: selectedMeal,
                        rating: rating,
                        comment: comment,
                        // user_email can be added here if we want to track who submitted
                    }
                ]);

            if (error) throw error;

            setIsSuccess(true);
            setRating(0);
            setComment("");
            // Optional: Keep day/meal selected for subsequent feedback or clear them
        } catch (error: any) {
            console.error('Error submitting food feedback:', error);
            alert('Failed to submit feedback: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#0B0B1C] flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in-up">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-500/20 p-4 rounded-full">
                            <CheckCircle className="w-16 h-16 text-green-400" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Delicious!</h2>
                    <p className="text-gray-300 mb-8 text-lg">
                        Thanks for rating the {selectedMeal}. Your feedback helps us serve you better!
                    </p>
                    <button
                        onClick={() => setIsSuccess(false)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-full hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all transform hover:scale-105"
                    >
                        Rate Another Meal
                    </button>

                    <div className="mt-8">
                        <a href="/" className="text-gray-400 hover:text-white text-sm">Back to Home</a>
                    </div>
                </div>
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-[#0B0B1C] relative overflow-hidden flex flex-col items-center justify-center p-4">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-600 rounded-full blur-[120px] opacity-20"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-600 rounded-full blur-[120px] opacity-10"></div>
            </div>

            <main className="w-full max-w-lg z-10 relative">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200 mb-2">
                        Food Feedback
                    </h1>
                    <p className="text-gray-400 text-lg">How was the food? Be honest!</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Day Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 pl-1">Select Day</label>
                            <select
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(e.target.value)}
                                className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all appearance-none cursor-pointer"
                                required
                            >
                                <option value="" disabled>Choose a Day...</option>
                                {EVENT_DAYS.map(day => (
                                    <option key={day.value} value={day.value} className="bg-gray-900">{day.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Meal Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 pl-1">Select Meal</label>
                            <select
                                value={selectedMeal}
                                onChange={(e) => setSelectedMeal(e.target.value)}
                                className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all appearance-none cursor-pointer"
                                required
                            >
                                <option value="" disabled>Choose a Meal...</option>
                                {MEAL_TYPES.map(meal => (
                                    <option key={meal.value} value={meal.value} className="bg-gray-900">{meal.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Star Rating */}
                        <div className="py-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2 pl-1 text-center">Rate your experience</label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none transition-transform hover:scale-110 active:scale-90"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            className={`w-10 h-10 ${star <= (hoverRating || rating)
                                                ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                                : "text-gray-600"
                                                } transition-colors duration-200`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="text-center h-6 mt-1">
                                {rating > 0 && (
                                    <span className="text-yellow-400 font-medium animate-fade-in">
                                        {rating === 5 ? "Excellent! 😋" :
                                            rating === 4 ? "Good! 🙂" :
                                                rating === 3 ? "Average 😐" :
                                                    rating === 2 ? "Below Average 😕" : "Poor 😞"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Comment */}
                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2 pl-1">
                                Additional Feedback <span className="text-gray-500">(Optional)</span>
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                                placeholder="What did you like? What can be improved?"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Rating
                                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>

    );
}
