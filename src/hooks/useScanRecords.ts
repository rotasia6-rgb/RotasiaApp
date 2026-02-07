
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ScanRecord } from "@/lib/data";

export function useScanRecords() {
    const [records, setRecords] = useState<ScanRecord[]>([]);

    useEffect(() => {
        // Initial fetch
        const fetchRecords = async () => {
            let allRecords: ScanRecord[] = [];
            let page = 0;
            const pageSize = 1000;
            let hasMore = true;

            while (hasMore) {
                const { data, error } = await supabase
                    .from("scans")
                    .select("*")
                    .range(page * pageSize, (page + 1) * pageSize - 1);

                if (error) {
                    console.error("Error fetching scans:", error);
                    hasMore = false;
                } else if (data) {
                    allRecords = [...allRecords, ...data as ScanRecord[]];
                    if (data.length < pageSize) {
                        hasMore = false;
                    } else {
                        page++;
                    }
                } else {
                    hasMore = false;
                }
            }

            console.log(`[useScanRecords] Fetched total valid scans: ${allRecords.length}`);
            setRecords(allRecords);
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
