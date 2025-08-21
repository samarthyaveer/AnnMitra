-- AnnMitra Database Schema
-- This file contains the SQL commands to set up the database tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table (stores profile info, linked to Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL, -- maps to Clerk user id
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('canteen','student','ngo','admin')),
  email TEXT UNIQUE,
  phone TEXT,
  organization_name TEXT, -- for canteens and NGOs
  campus_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings table (food items shared by canteens)
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  food_type TEXT,
  quantity NUMERIC, -- e.g., kg or number of meals
  quantity_unit TEXT DEFAULT 'meals', -- 'kg', 'meals', 'portions'
  safety_window_hours INTEGER DEFAULT 4, -- safe to eat for X hours
  available_from TIMESTAMPTZ DEFAULT NOW(),
  available_until TIMESTAMPTZ,
  pickup_location_lat DECIMAL(10,8), -- latitude
  pickup_location_lng DECIMAL(11,8), -- longitude
  address TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','claimed','picked_up','expired','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pickups table (tracks who claims what food)
CREATE TABLE pickups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  claimer_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','collected','cancelled')),
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ,
  pickup_code TEXT, -- verification code for pickup
  notes TEXT
);

-- Metrics table (environmental impact tracking)
CREATE TABLE metrics_food_saved (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id),
  pickup_id UUID REFERENCES pickups(id),
  weight_saved_kg NUMERIC,
  people_served_est INTEGER,
  carbon_kg_saved NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_listings_owner_id ON listings(owner_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_available_until ON listings(available_until);
CREATE INDEX idx_pickups_listing_id ON pickups(listing_id);
CREATE INDEX idx_pickups_claimer_id ON pickups(claimer_id);
CREATE INDEX idx_pickups_status ON pickups(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_food_saved ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = clerk_id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Everyone can view available listings
CREATE POLICY "Everyone can view available listings" ON listings FOR SELECT USING (status = 'available');
-- Only canteen owners can create listings
CREATE POLICY "Canteen owners can create listings" ON listings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'canteen')
);
-- Owners can update their own listings
CREATE POLICY "Owners can update own listings" ON listings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND users.id = listings.owner_id)
);

-- Pickup policies
CREATE POLICY "Users can view their own pickups" ON pickups FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND users.id = pickups.claimer_id)
  OR EXISTS (SELECT 1 FROM users u JOIN listings l ON u.id = l.owner_id WHERE u.clerk_id = auth.uid()::text AND l.id = pickups.listing_id)
);

-- Insert some sample data (optional for testing)
-- This will be populated via the API later
