
import { ScanRecord, DAYS, PURPOSES_BY_DAY, Day } from "./data";

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
}

export const calculateStats = (records: ScanRecord[], delegates: { id: string }[]): DashboardStats => {
    const totalDelegates = delegates.length;
    // Use delegate_id
    const uniqueIds = new Set(records.map((r) => r.delegate_id));
    const uniqueRecorded = uniqueIds.size;
    const totalRecordings = records.length;

    const dailyStats = DAYS.map((day) => {
        const purposes = PURPOSES_BY_DAY[day];
        const dayRecords = records.filter((r) => r.day === day);

        // Calculate stats per purpose
        const purposeStats = purposes.map((purpose) => {
            const count = dayRecords.filter((r) => r.purpose === purpose).length;
            return {
                name: purpose,
                count,
                percentage: (count / totalDelegates) * 100,
            };
        });

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
        totalRecordings,
        uniquePercentage: ((uniqueRecorded / totalDelegates) * 100).toFixed(1),
        dailyStats,
    };
};
