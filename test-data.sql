-- Test data for analytics charts
-- This creates some sample historical data to demonstrate the charts

-- Insert some test listings with historical dates
INSERT INTO food_listings (
  id,
  owner_id,
  title,
  description,
  quantity,
  location,
  latitude,
  longitude,
  expiry_time,
  created_at,
  status
) VALUES 
-- Data from 7 days ago
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Test Pasta', 'Sample pasta for testing', 2.5, 'Test Canteen', 28.6139, 77.2090, NOW() - INTERVAL '7 days' + INTERVAL '3 hours', NOW() - INTERVAL '7 days', 'expired'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Test Sandwiches', 'Sample sandwiches', 1.2, 'Test Canteen', 28.6139, 77.2090, NOW() - INTERVAL '7 days' + INTERVAL '3 hours', NOW() - INTERVAL '7 days', 'completed'),

-- Data from 6 days ago
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Test Pizza', 'Sample pizza slices', 3.0, 'Test Canteen', 28.6139, 77.2090, NOW() - INTERVAL '6 days' + INTERVAL '3 hours', NOW() - INTERVAL '6 days', 'completed'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Test Curry', 'Sample curry', 2.0, 'Test Canteen', 28.6139, 77.2090, NOW() - INTERVAL '6 days' + INTERVAL '3 hours', NOW() - INTERVAL '6 days', 'expired'),

-- Data from 5 days ago
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Test Salad', 'Fresh salad', 1.5, 'Test Canteen', 28.6139, 77.2090, NOW() - INTERVAL '5 days' + INTERVAL '3 hours', NOW() - INTERVAL '5 days', 'completed'),

-- Data from 4 days ago
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Test Soup', 'Tomato soup', 1.8, 'Test Canteen', 28.6139, 77.2090, NOW() - INTERVAL '4 days' + INTERVAL '3 hours', NOW() - INTERVAL '4 days', 'completed'),
('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Test Bread', 'Fresh bread', 0.8, 'Test Canteen', 28.6139, 77.2090, NOW() - INTERVAL '4 days' + INTERVAL '3 hours', NOW() - INTERVAL '4 days', 'completed'),

-- Data from 3 days ago
('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Test Rice', 'Fried rice', 2.2, 'Test Canteen', 28.6139, 77.2090, NOW() - INTERVAL '3 days' + INTERVAL '3 hours', NOW() - INTERVAL '3 days', 'completed'),

-- Data from 2 days ago
('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Test Noodles', 'Instant noodles', 1.0, 'Test Canteen', 28.6139, 77.2090, NOW() - INTERVAL '2 days' + INTERVAL '3 hours', NOW() - INTERVAL '2 days', 'completed'),
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Test Burger', 'Veggie burger', 0.5, 'Test Canteen', 28.6139, 77.2090, NOW() - INTERVAL '2 days' + INTERVAL '3 hours', NOW() - INTERVAL '2 days', 'expired'),

-- Data from 1 day ago
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Test Wrap', 'Chicken wrap', 0.7, 'Test Canteen', 28.6139, 77.2090, NOW() - INTERVAL '1 day' + INTERVAL '3 hours', NOW() - INTERVAL '1 day', 'completed')

ON CONFLICT (id) DO NOTHING;

-- Insert some test pickups for completed listings
INSERT INTO food_pickups (
  id,
  listing_id,
  claimer_id,
  status,
  pickup_code,
  created_at,
  completed_at
) VALUES 
-- Pickups for completed listings
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'completed', 'TEST01', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '30 minutes'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'completed', 'TEST02', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '45 minutes'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'completed', 'TEST03', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '20 minutes'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'completed', 'TEST04', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '35 minutes'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', 'completed', 'TEST05', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '25 minutes'),
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', 'completed', 'TEST06', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '40 minutes'),
('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003', 'completed', 'TEST07', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'),
('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000002', 'completed', 'TEST08', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes')

ON CONFLICT (id) DO NOTHING;

-- Create some test users if they don't exist
INSERT INTO users (id, email, role, name, location) VALUES 
('00000000-0000-0000-0000-000000000001', 'testcanteen@example.com', 'canteen', 'Test Canteen', 'Campus Canteen'),
('00000000-0000-0000-0000-000000000002', 'testuser@example.com', 'user', 'Test User', 'Campus Dorm'),
('00000000-0000-0000-0000-000000000003', 'testngo@example.com', 'ngo', 'Test NGO', 'Campus NGO Office')
ON CONFLICT (id) DO NOTHING;

-- Verify data
SELECT 'Sample data inserted successfully' as message;
SELECT COUNT(*) as total_listings FROM food_listings WHERE created_at >= NOW() - INTERVAL '8 days';
SELECT COUNT(*) as total_pickups FROM food_pickups WHERE created_at >= NOW() - INTERVAL '8 days';
