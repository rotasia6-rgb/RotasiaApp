-- Add new columns to feedback table
ALTER TABLE public.feedback 
ADD COLUMN IF NOT EXISTS day text,
ADD COLUMN IF NOT EXISTS meal_type text,
ADD COLUMN IF NOT EXISTS rating integer;

-- Add check constraint for rating (1-5)
ALTER TABLE public.feedback 
ADD CONSTRAINT feedback_rating_check CHECK (rating >= 1 AND rating <= 5);

-- Comment on columns
COMMENT ON COLUMN public.feedback.day IS 'Day of the event (e.g., Feb 6, Feb 7)';
COMMENT ON COLUMN public.feedback.meal_type IS 'Type of meal (Breakfast, Lunch, Dinner)';
COMMENT ON COLUMN public.feedback.rating IS 'Star rating (1-5)';
