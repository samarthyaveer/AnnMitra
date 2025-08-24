-- Migration: Update listings status constraint from 'expired' to 'unavailable'
-- Run this in Supabase SQL Editor for both local and production databases

-- STEP 1: First, update any existing 'expired' records to 'unavailable'
-- (We need to do this BEFORE dropping the constraint)
UPDATE listings 
SET status = 'unavailable', updated_at = NOW() 
WHERE status = 'expired';

-- STEP 2: Check if there are any invalid status values
SELECT DISTINCT status 
FROM listings 
WHERE status NOT IN ('available', 'claimed', 'picked_up', 'unavailable', 'cancelled');

-- STEP 3: Fix any other invalid status values (if any exist)
-- Uncomment and modify this if the above query shows unexpected values
-- UPDATE listings SET status = 'unavailable' WHERE status NOT IN ('available', 'claimed', 'picked_up', 'unavailable', 'cancelled');

-- STEP 4: Drop the old constraint that includes 'expired'
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;

-- STEP 5: Add the new constraint with 'unavailable' instead of 'expired'
ALTER TABLE listings ADD CONSTRAINT listings_status_check 
CHECK (status IN ('available', 'claimed', 'picked_up', 'unavailable', 'cancelled'));

-- STEP 6: Also update any notifications that reference 'listing_expired'
UPDATE notifications 
SET type = 'listing_unavailable' 
WHERE type = 'listing_expired';

-- STEP 7: Verify the changes
SELECT status, COUNT(*) as count 
FROM listings 
GROUP BY status;
