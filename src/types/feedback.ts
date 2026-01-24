export type FeedbackStatus = 'pending' | 'approved' | 'rejected';

export interface Feedback {
    id: string;
    created_at: string;
    name: string;
    message: string;
    status: FeedbackStatus;
}
