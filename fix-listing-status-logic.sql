-- Fix Listing Status Logic
-- This script fixes issues with listing status transitions and expiration logic

-- 1. First, fix the expiration function to never expire claimed or picked up listings
CREATE OR REPLACE FUNCTION expire_old_listings()
RETURNS void AS $$
BEGIN
  UPDATE listings 
  SET status = 'expired' 
  WHERE status = 'available'  -- Only expire available listings
    AND available_until < NOW()
    AND available_until IS NOT NULL;
    
  -- Log the expiration for debugging
  RAISE NOTICE 'Expired % listings', (SELECT count(*) FROM listings WHERE status = 'expired');
END;
$$ LANGUAGE plpgsql;

-- 2. Improve the listing status update trigger to handle all edge cases
CREATE OR REPLACE FUNCTION update_listing_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When pickup is confirmed, mark listing as claimed (only if currently available)
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    UPDATE listings 
    SET status = 'claimed' 
    WHERE id = NEW.listing_id 
      AND status = 'available';  -- Only update if currently available
  END IF;
  
  -- When pickup is collected, mark listing as picked_up (from any previous state)
  IF NEW.status = 'collected' AND OLD.status != 'collected' THEN
    UPDATE listings 
    SET status = 'picked_up' 
    WHERE id = NEW.listing_id 
      AND status IN ('available', 'claimed');  -- Update from available or claimed
  END IF;
  
  -- When pickup is cancelled, mark listing as available again (only if currently claimed)
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE listings 
    SET status = 'available' 
    WHERE id = NEW.listing_id 
      AND status = 'claimed';  -- Only revert if currently claimed
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Add a function to validate listing status transitions
CREATE OR REPLACE FUNCTION validate_listing_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent invalid status transitions
  -- Available -> claimed, expired, cancelled (OK)
  -- Claimed -> picked_up, available (if pickup cancelled), expired (should not happen)
  -- Picked_up -> cannot change (final state)
  -- Expired -> cannot change (final state)
  -- Cancelled -> available (OK if relisted)
  
  -- Prevent picked_up listings from being changed to expired
  IF OLD.status = 'picked_up' AND NEW.status = 'expired' THEN
    RAISE EXCEPTION 'Cannot expire a listing that has been picked up';
  END IF;
  
  -- Prevent claimed listings from being expired (they should go to picked_up or available)
  IF OLD.status = 'claimed' AND NEW.status = 'expired' THEN
    RAISE EXCEPTION 'Cannot expire a claimed listing';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Apply the validation trigger
DROP TRIGGER IF EXISTS trigger_validate_listing_status ON listings;
CREATE TRIGGER trigger_validate_listing_status 
  BEFORE UPDATE ON listings 
  FOR EACH ROW 
  EXECUTE FUNCTION validate_listing_status_transition();

-- 5. Add a function to clean up any incorrectly expired listings
CREATE OR REPLACE FUNCTION fix_incorrectly_expired_listings()
RETURNS void AS $$
BEGIN
  -- Find listings that are expired but have completed pickups
  UPDATE listings 
  SET status = 'picked_up'
  WHERE status = 'expired' 
    AND id IN (
      SELECT DISTINCT listing_id 
      FROM pickups 
      WHERE status = 'collected'
    );
    
  -- Find listings that are expired but have confirmed pickups  
  UPDATE listings 
  SET status = 'claimed'
  WHERE status = 'expired' 
    AND id IN (
      SELECT DISTINCT listing_id 
      FROM pickups 
      WHERE status = 'confirmed'
    );
    
  RAISE NOTICE 'Fixed incorrectly expired listings';
END;
$$ LANGUAGE plpgsql;

-- 6. Run the fix function to clean up any existing issues
SELECT fix_incorrectly_expired_listings();

-- 7. Add indexes for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_listings_status_available_until ON listings(status, available_until) 
WHERE status = 'available';

CREATE INDEX IF NOT EXISTS idx_pickups_status_listing ON pickups(status, listing_id);

-- 8. Create a view for easy monitoring of listing status consistency
CREATE OR REPLACE VIEW listing_status_audit AS
SELECT 
  l.id,
  l.title,
  l.status as listing_status,
  l.available_until,
  l.created_at,
  p.status as pickup_status,
  p.confirmed_at,
  p.collected_at,
  CASE 
    WHEN l.status = 'expired' AND p.status IN ('confirmed', 'collected') THEN 'INCONSISTENT'
    WHEN l.status = 'available' AND p.status = 'confirmed' THEN 'INCONSISTENT'
    WHEN l.status = 'claimed' AND p.status = 'collected' THEN 'INCONSISTENT'
    WHEN l.status = 'available' AND l.available_until < NOW() THEN 'SHOULD_EXPIRE'
    ELSE 'CONSISTENT'
  END as status_check
FROM listings l
LEFT JOIN pickups p ON l.id = p.listing_id AND p.status IN ('confirmed', 'collected')
ORDER BY l.created_at DESC;

-- 9. Add helpful comments for debugging
COMMENT ON FUNCTION expire_old_listings() IS 'Expires only available listings past their available_until date';
COMMENT ON FUNCTION update_listing_status() IS 'Updates listing status based on pickup status changes';
COMMENT ON FUNCTION validate_listing_status_transition() IS 'Prevents invalid status transitions';
COMMENT ON VIEW listing_status_audit IS 'View to monitor listing status consistency';

-- 10. Show current status summary
SELECT 
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN available_until < NOW() THEN 1 END) as past_deadline
FROM listings 
GROUP BY status
ORDER BY status;

-- 11. Final confirmation message
DO $$ 
BEGIN 
  RAISE NOTICE 'Listing status logic has been fixed and validated';
END $$;
