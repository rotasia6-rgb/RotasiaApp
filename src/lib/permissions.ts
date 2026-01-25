import { Day } from "./data";

export type UserPermission = {
    allowedDays: Day[];
    allowedPurposes: string[];
};

export const PERMISSIONS: Record<string, UserPermission> = {
    "Kit": {
        allowedDays: [1],
        allowedPurposes: ["Kit"]
    },
    "Seargent": {
        allowedDays: [1, 2, 3, 4],
        allowedPurposes: ["Attendance"]
    },
    "Food": {
        allowedDays: [1, 2, 3, 4],
        allowedPurposes: ["Breakfast", "Lunch", "Dinner", "High Tea"]
    },
    "Transport": {
        allowedDays: [1, 2, 3, 4],
        allowedPurposes: ["Pickup 1", "Pickup 2", "Pickup", "Drop"]
    },
    "Kumar": {
        allowedDays: [1, 2, 3, 4],
        allowedPurposes: ["ALL"] // Special flag for all access
    }
};
