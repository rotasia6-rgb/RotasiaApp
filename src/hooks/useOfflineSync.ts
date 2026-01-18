import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ScanRecord } from "@/lib/data";

const STORAGE_KEY = "scan_queue";

export function useOfflineSync() {
    const [queueLength, setQueueLength] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // Initial load
    useEffect(() => {
        const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        setQueueLength(queue.length);
    }, []);

    const addToQueue = (scan: Omit<ScanRecord, "id">) => {
        const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        queue.push(scan);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
        setQueueLength(queue.length);

        // Try simple immediate sync trigger (debounced in real app)
        syncNow();
    };

    const syncNow = async () => {
        if (isSyncing) return;

        const queueStr = localStorage.getItem(STORAGE_KEY);
        if (!queueStr) return;

        const queue: Omit<ScanRecord, "id">[] = JSON.parse(queueStr);
        if (queue.length === 0) return;

        setIsSyncing(true);
        console.log(`Attempting to sync ${queue.length} records...`);

        try {
            // Try inserting batch
            const { error } = await supabase.from("scans").insert(queue);

            if (!error) {
                // Success - clear queue
                console.log("Sync success!");
                localStorage.removeItem(STORAGE_KEY);
                setQueueLength(0);
            } else {
                console.error("Sync failed:", error);
                // Keep in queue for retry. 
                // In sophisticated apps, we'd remove *only* successful ones if doing 1-by-1, 
                // or handle partial batch failures.
            }
        } catch (err) {
            console.error("Network error during sync:", err);
        } finally {
            setIsSyncing(false);
        }
    };

    // Periodic Sync (every 30s)
    useEffect(() => {
        const interval = setInterval(() => {
            if (navigator.onLine) {
                syncNow();
            }
        }, 30000); // 30 seconds

        // Also sync when coming back online
        const handleOnline = () => syncNow();
        window.addEventListener("online", handleOnline);

        return () => {
            clearInterval(interval);
            window.removeEventListener("online", handleOnline);
        };
    }, []);

    return {
        addToQueue,
        syncNow,
        queueLength,
        isSyncing
    };
}
