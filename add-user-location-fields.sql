-- Migration to add GPS coordinates to users table
-- Run this in your Supabase SQL Editor

-- Add campus location coordinates to users table
ALTER TABLE users 
ADD COLUMN campus_location_lat DECIMAL(10,8),
ADD COLUMN campus_location_lng DECIMAL(11,8);

-- Add comment to explain the columns
COMMENT ON COLUMN users.campus_location_lat IS 'Latitude of user campus location';
COMMENT ON COLUMN users.campus_location_lng IS 'Longitude of user campus location';

-- Add index for location-based queries (optional)
CREATE INDEX idx_users_campus_location ON users(campus_location_lat, campus_location_lng)
WHERE campus_location_lat IS NOT NULL AND campus_location_lng IS NOT NULL;
