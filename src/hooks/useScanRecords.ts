
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ScanRecord } from "@/lib/data";

export function useScanRecords() {
    const [records, setRecords] = useState<ScanRecord[]>([]);

    useEffect(() => {
        // Initial fetch
        const fetchRecords = async () => {
            const { data, error } = await supabase
                .from("scans")
                .select("*");

            if (error) {
                console.error("Error fetching scans:", error);
            } else if (data) {
                setRecords(data as ScanRecord[]);
            }
        };

        fetchRecords();

        // Realtime subscription
        const channel = supabase
            .channel("scans_changes")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "scans" },
                (payload) => {
                    const newRecord = payload.new as ScanRecord;
                    setRecords((prev) => [...prev, newRecord]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return records;
}
