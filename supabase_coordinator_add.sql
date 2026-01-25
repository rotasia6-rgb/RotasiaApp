-- Create a table for Room Coordinators
CREATE TABLE IF NOT EXISTS room_coordinators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_number TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_number)
);

-- Insert Dummy Data for Coordinators (4 entries)
INSERT INTO room_coordinators (room_number, name, phone) VALUES
('101', 'Arjun Kapoor', '+91 98765 43210'),
('102', 'Priya Sharma', '+91 87654 32109'),
('103', 'Rohan Das', '+91 76543 21098'),
('104', 'Sneha Reddy', '+91 65432 10987')
ON CONFLICT (room_number) DO UPDATE 
SET name = EXCLUDED.name, phone = EXCLUDED.phone;

-- Reload configuration to ensure schema is picked up
NOTIFY pgrst, 'reload config';
