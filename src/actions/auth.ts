"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Hardcoded credentials as requested
    if (username === "Kumar" && password === "Kumar02") {
        // Set cookie valid for 1 day
        cookies().set("auth_session", "valid", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });

        return { success: true };
    }

    return { success: false, message: "Invalid username or password" };
}

export async function logoutAction() {
    cookies().delete("auth_session");
    redirect("/login");
}
