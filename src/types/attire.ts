export type AttireStatus = 'pending' | 'approved' | 'rejected';

export interface AttireEntry {
    id: string;
    created_at: string;
    user_name: string;
    image_url: string;
    caption?: string;
    likes: number;
    status: AttireStatus;
}
