import { ScanRecord, InvalidScanRecord, DAYS, PURPOSES_BY_DAY, Day } from "./data";

export interface DashboardStats {
    totalDelegates: number;
    uniqueRecorded: number;
    totalRecordings: number;
    uniquePercentage: string;
    dailyStats: DailyStat[];
}

export interface DailyStat {
    day: Day;
    completionRate: number;
    purposes: PurposeStat[];
}

export interface PurposeStat {
    name: string;
    count: number;
    percentage: number;
    duplicateCount?: number;
    invalidCount?: number;
}
// ... (imports and DashboardStats interface unchanged)

// ... (DailyStat interface unchanged)

export const calculateStats = (records: ScanRecord[], invalidRecords: InvalidScanRecord[], delegates: { id: string }[]): DashboardStats => {
    // ... (unchanged part)
    const totalDelegates = delegates.length;
    // Use delegate_id
    const uniqueIds = new Set(records.map((r) => r.delegate_id));
    const uniqueRecorded = uniqueIds.size;
    const totalRecordings = records.length + invalidRecords.length;

    const dailyStats = DAYS.map((day) => {
        const purposes = PURPOSES_BY_DAY[day];
        // Ensure day is treated as number for comparison
        const dayRecords = records.filter((r) => Number(r.day) === day);
        const dayInvalidRecords = invalidRecords.filter((r) => Number(r.day) === day);

        // Calculate stats per purpose
        const purposeStats = purposes.map((purpose) => {
            const count = dayRecords.filter((r) => r.purpose === purpose).length;

            // Filter invalid records by reason
            const purposeInvalidRecords = dayInvalidRecords.filter((r) => r.purpose === purpose);
            const duplicateCount = purposeInvalidRecords.filter(r => r.reason === 'duplicate').length;
            const invalidCount = purposeInvalidRecords.filter(r => r.reason !== 'duplicate').length;

            const totalCount = count + duplicateCount + invalidCount;

            // Console log for debugging specific mismatched counts
            if (day === 3 && purpose === "Breakfast") {
                console.log(`[DEBUG] Day 3 Breakfast: Valid=${count}, Duplicates=${duplicateCount}, Invalid=${invalidCount}, Total=${totalCount}`);
            }

            return {
                name: purpose,
                count: totalCount,
                percentage: (totalCount / totalDelegates) * 100,
                duplicateCount,
                invalidCount,
            };
        });
        // ... (rest of the file)

        // "Percentage of delegates who completed ALL purposes for each day"
        let completedAllCount = 0;
        delegates.forEach(d => { // iterate all possible delegates
            // filter records for this delegate on this day
            const delegateRecords = dayRecords.filter(r => r.delegate_id === d.id);
            const recordedPurposes = new Set(delegateRecords.map(r => r.purpose));

            // check if they have all purposes
            if (purposes.every(p => recordedPurposes.has(p))) {
                completedAllCount++;
            }
        });

        return {
            day,
            completionRate: (completedAllCount / totalDelegates) * 100,
            purposes: purposeStats,
        };
    });

    return {
        totalDelegates,
        uniqueRecorded,
        totalRecordings: totalRecordings, // explicit
        uniquePercentage: ((uniqueRecorded / totalDelegates) * 100).toFixed(1),
        dailyStats,
    };
};
