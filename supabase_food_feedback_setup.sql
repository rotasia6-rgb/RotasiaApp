-- Create food_feedback table
CREATE TABLE IF NOT EXISTS public.food_feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    day text NOT NULL, -- e.g. "Feb 6"
    meal_type text NOT NULL, -- e.g. "Breakfast"
    rating integer CHECK (rating >= 1 AND rating <= 5),
    comment text,
    user_email text -- Optional: to track who submitted
);

-- Enable RLS
ALTER TABLE public.food_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous/authenticated inserts (Delegate usage)
CREATE POLICY "Enable insert for all users" ON public.food_feedback
    FOR INSERT WITH CHECK (true);

-- Create policy to allow reading only by authenticated admins (if needed) or public
-- For now, maybe just allow insert. We don't need a public read policy since it's "not visible on the wall".
