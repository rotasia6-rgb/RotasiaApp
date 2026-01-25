export interface Nomination {
    id: string;
    created_at: string;
    contestant_name: string;
    contestant_photo?: string;
    category: string;
    votes: number;
    gender?: 'male' | 'female';
}
