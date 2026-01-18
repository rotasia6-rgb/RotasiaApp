
export type Delegate = {
    id: string;
    name: string;
    organization?: string; // Added optional field to match DB schema if needed
};

export type Day = 1 | 2 | 3 | 4;

export const DAYS: Day[] = [1, 2, 3, 4];

export const PURPOSES_BY_DAY: Record<Day, string[]> = {
    1: ["Pickup 1", "Pickup 2", "Attendance", "Lunch", "High Tea", "Kit", "Dinner", "Drop"],
    2: ["Pickup", "Attendance", "Breakfast", "Lunch", "High Tea", "Dinner", "Drop"],
    3: ["Pickup", "Attendance", "Breakfast", "Lunch", "High Tea", "Dinner", "Drop"],
    4: ["Pickup", "Attendance", "Breakfast", "Lunch", "Drop"],
};

// DELEGATES Mock Removed. User must fetch from Supabase.
// See src/hooks/useDelegates.ts

export type ScanRecord = {
    id?: string;
    delegate_id: string;
    day: Day;
    purpose: string;
    timestamp: string; // ISO string
};
