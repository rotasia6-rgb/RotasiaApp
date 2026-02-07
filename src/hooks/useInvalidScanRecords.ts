
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { InvalidScanRecord } from "@/lib/data";

export function useInvalidScanRecords() {
    const [records, setRecords] = useState<InvalidScanRecord[]>([]);

    useEffect(() => {
        // Initial fetch
        const fetchRecords = async () => {
            let allRecords: InvalidScanRecord[] = [];
            let page = 0;
            const pageSize = 1000;
            let hasMore = true;

            while (hasMore) {
                const { data, error } = await supabase
                    .from("invalid_scans")
                    .select("*")
                    .range(page * pageSize, (page + 1) * pageSize - 1);

                if (error) {
                    console.error("Error fetching invalid scans:", error);
                    hasMore = false;
                } else if (data) {
                    allRecords = [...allRecords, ...data as unknown as InvalidScanRecord[]];
                    if (data.length < pageSize) {
                        hasMore = false;
                    } else {
                        page++;
                    }
                } else {
                    hasMore = false;
                }
            }

            console.log(`[useInvalidScanRecords] Fetched total invalid scans: ${allRecords.length}`);
            setRecords(allRecords);
        };

        fetchRecords();

        // Realtime subscription
        const channel = supabase
            .channel("invalid_scans_changes")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "invalid_scans" },
                (payload) => {
                    console.log("Realtime invalid scan received:", payload.new);
                    const newRecord = payload.new as InvalidScanRecord;
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
