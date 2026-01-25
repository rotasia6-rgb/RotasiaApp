"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function loginAction(prevState: any, formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const CREDENTIALS: Record<string, string> = {
        "Kumar": "Kumar02",
        "Kit": "V0523A",
        "Seargent": "N0523K",
        "Food": "V0523K",
        "Transport": "K0523N"
    };

    if (CREDENTIALS[username] && CREDENTIALS[username] === password) {
        // Set secure auth session
        cookies().set("auth_session", "valid", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });

        // Set user identity for client-side permission handling (not httpOnly)
        cookies().set("current_user", username, {
            httpOnly: false, // Accessible to JS
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });

        return { success: true };
    }

    return { success: false, message: "Invalid username or password" };
}


export async function logoutAction() {
    cookies().set("auth_session", "", { path: "/", maxAge: 0 });
    cookies().set("current_user", "", { path: "/", maxAge: 0 });
    revalidatePath("/dashboard");
    redirect("/login");
}
