"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/actions/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center"
        >
            {pending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                "Sign In"
            )}
        </button>
    );
}

const initialState = {
    success: false,
    message: "",
};

export default function LoginPage() {
    const [state, formAction] = useFormState(loginAction, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push("/dashboard");
        }
    }, [state.success, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500 mt-2">Sign in to Rotasia Delegate Tracker</p>
                </div>

                <form action={formAction} className="space-y-4">
                    {state.message && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
                            {state.message}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enter username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-2">
                        <SubmitButton />
                    </div>
                </form>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Authorized Personnel Only
                </p>
            </div>
        </div>
    );
}
