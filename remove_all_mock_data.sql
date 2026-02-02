-- 1. Clear Best Attire Entries (User submissions)
TRUNCATE TABLE best_attire_entries;

-- 2. Clear Nominations (Voting data)
-- Use TRUNCATE to remove all rows
TRUNCATE TABLE nominations;

-- 3. Clear Room Coordinators (Mock coordinators)
TRUNCATE TABLE room_coordinators;

-- 4. Revert Delegate Mock Data
-- Sets the fields modified by mock_data_update.sql back to NULL for the specific test IDs.
UPDATE delegates 
SET 
    email = NULL, 
    club_name = NULL, 
    district = NULL, 
    room_number = NULL, 
    rotasia_id = NULL, 
    phone = NULL
WHERE id IN (
    'EVT-0041', -- Delegate 363 (Room 101)
    'EVT-006F', -- Delegate 168 (Room 101)
    'EVT-00AC', -- Delegate 610 (Room 102)
    'EVT-00EC', -- Delegate 381 (Room 102)
    'EVT-0116', -- Delegate 236 (Room 102)
    'EVT-0138', -- Delegate 348 (Room 103)
    'EVT-013D'  -- Delegate 138 (Unassigned)
);
