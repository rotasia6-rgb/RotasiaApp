-- Update existing records with mock data for testing "Find My Room"

-- Room 101: 2 People (Roommates)
UPDATE delegates 
SET 
    email = 'user363@rotasia.com',
    club_name = 'RAC Chennai East',
    district = 'District 3232',
    room_number = '101',
    rotasia_id = 'ROT-363',
    phone = '+91 98765 00363'
WHERE id = 'EVT-0041'; -- Delegate 363

UPDATE delegates 
SET 
    email = 'user168@rotasia.com',
    club_name = 'RAC Mumbai West',
    district = 'District 3141',
    room_number = '101',
    rotasia_id = 'ROT-168',
    phone = '+91 98765 00168'
WHERE id = 'EVT-006F'; -- Delegate 168


-- Room 102: 3 People (Roommates)
UPDATE delegates 
SET 
    email = 'user610@rotasia.com',
    club_name = 'RAC Delhi South',
    district = 'District 3011',
    room_number = '102',
    rotasia_id = 'ROT-610',
    phone = '+91 98765 00610'
WHERE id = 'EVT-00AC'; -- Delegate 610

UPDATE delegates 
SET 
    email = 'user381@rotasia.com',
    club_name = 'RAC Bangalore Central',
    district = 'District 3190',
    room_number = '102',
    rotasia_id = 'ROT-381',
    phone = '+91 98765 00381'
WHERE id = 'EVT-00EC'; -- Delegate 381

UPDATE delegates 
SET 
    email = 'user236@rotasia.com',
    club_name = 'RAC Pune Camp',
    district = 'District 3131',
    room_number = '102',
    rotasia_id = 'ROT-236',
    phone = '+91 98765 00236'
WHERE id = 'EVT-0116'; -- Delegate 236


-- Room 103: Single Occupancy
UPDATE delegates 
SET 
    email = 'user348@rotasia.com',
    club_name = 'RAC Kolkata',
    district = 'District 3291',
    room_number = '103',
    rotasia_id = 'ROT-348',
    phone = '+91 98765 00348'
WHERE id = 'EVT-0138'; -- Delegate 348


-- Others (No Room Assigned yet)
UPDATE delegates 
SET 
    email = 'user138@rotasia.com',
    club_name = 'RAC Hyderabad',
    district = 'District 3150',
    room_number = NULL, -- Not assigned
    rotasia_id = 'ROT-138',
    phone = '+91 98765 00138'
WHERE id = 'EVT-013D'; -- Delegate 138
