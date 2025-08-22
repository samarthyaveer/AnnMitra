-- Migration: Add notification support and realtime features
-- Run this after the base schema to add Phase 6 features

-- Add FCM token and notification preferences to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS campus_location_lat DECIMAL(10,8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS campus_location_lng DECIMAL(11,8);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('listing_claimed', 'pickup_confirmed', 'pickup_ready', 'pickup_completed', 'listing_expired')),
  data JSONB, -- additional data for the notification
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Add RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND users.id = notifications.user_id)
);
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND users.id = notifications.user_id)
);

-- Enable realtime for important tables (safe to run multiple times)
DO $$
BEGIN
  -- Add listings to realtime if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'listings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE listings;
  END IF;

  -- Add pickups to realtime if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'pickups'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE pickups;
  END IF;

  -- Add notifications to realtime if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

-- Create function to generate pickup codes
CREATE OR REPLACE FUNCTION generate_pickup_code()
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6));
END;
$$ LANGUAGE plpgsql;

-- Function to automatically generate pickup code when pickup is confirmed
CREATE OR REPLACE FUNCTION set_pickup_code()
RETURNS TRIGGER AS $$
BEGIN
  -- For new pickups, generate pickup code if not already set
  IF TG_OP = 'INSERT' AND NEW.pickup_code IS NULL THEN
    NEW.pickup_code = generate_pickup_code();
    NEW.confirmed_at = NOW();
  END IF;
  
  -- For updates, handle status changes
  IF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'confirmed' AND (OLD.status != 'confirmed' OR OLD.pickup_code IS NULL) THEN
      IF NEW.pickup_code IS NULL THEN
        NEW.pickup_code = generate_pickup_code();
      END IF;
      NEW.confirmed_at = NOW();
    END IF;
    
    IF NEW.status = 'collected' AND OLD.status != 'collected' THEN
      NEW.collected_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply pickup code trigger for both INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_set_pickup_code ON pickups;
CREATE TRIGGER trigger_set_pickup_code 
  BEFORE INSERT OR UPDATE ON pickups 
  FOR EACH ROW 
  EXECUTE FUNCTION set_pickup_code();

-- Function to update listing status when pickup status changes
CREATE OR REPLACE FUNCTION update_listing_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When pickup is confirmed, mark listing as claimed
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    UPDATE listings SET status = 'claimed' WHERE id = NEW.listing_id;
  END IF;
  
  -- When pickup is collected, mark listing as picked_up
  IF NEW.status = 'collected' AND OLD.status != 'collected' THEN
    UPDATE listings SET status = 'picked_up' WHERE id = NEW.listing_id;
  END IF;
  
  -- When pickup is cancelled, mark listing as available again
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE listings SET status = 'available' WHERE id = NEW.listing_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply listing status update trigger
DROP TRIGGER IF EXISTS trigger_update_listing_status ON pickups;
CREATE TRIGGER trigger_update_listing_status 
  AFTER UPDATE ON pickups 
  FOR EACH ROW 
  EXECUTE FUNCTION update_listing_status();

-- Function to automatically expire listings
CREATE OR REPLACE FUNCTION expire_old_listings()
RETURNS void AS $$
BEGIN
  UPDATE listings 
  SET status = 'expired' 
  WHERE status = 'available' 
    AND available_until < NOW()
    AND available_until IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
