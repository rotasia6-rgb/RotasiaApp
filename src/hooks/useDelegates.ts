import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Delegate } from "@/lib/data";

export function useDelegates() {
    const [delegates, setDelegates] = useState<Delegate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDelegates() {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from("delegates")
                    .select("*")
                    .order("id", { ascending: true });

                if (error) {
                    throw error;
                }

                if (data) {
                    setDelegates(data as Delegate[]);
                }
            } catch (err: any) {
                console.error("Error fetching delegates:", err);
                setError(err.message || "Failed to load delegates");
            } finally {
                setIsLoading(false);
            }
        }

        fetchDelegates();
    }, []);

    return { delegates, isLoading, error };
}
