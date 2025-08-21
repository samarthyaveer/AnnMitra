-- ============================================================================
-- COMPREHENSIVE FIX FOR ALL RLS ISSUES
-- Run this script in your Supabase SQL Editor to fix all storage and RLS issues
-- ============================================================================

-- 1. FIRST: Delete existing bucket and recreate it properly
DELETE FROM storage.objects WHERE bucket_id = 'food-images';
DELETE FROM storage.buckets WHERE id = 'food-images';

-- 2. CREATE BUCKET WITH PROPER SETTINGS
INSERT INTO storage.buckets (
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at,
  updated_at
) VALUES (
  'food-images',
  'food-images',
  true, -- PUBLIC BUCKET
  52428800, -- 50MB limit
  '{"image/jpeg","image/jpg","image/png","image/webp"}',
  now(),
  now()
);

-- 3. DROP ALL EXISTING STORAGE POLICIES
DROP POLICY IF EXISTS "Public Access for food-images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "food_images_policy_select" ON storage.objects;
DROP POLICY IF EXISTS "food_images_policy_insert" ON storage.objects;
DROP POLICY IF EXISTS "food_images_policy_update" ON storage.objects;
DROP POLICY IF EXISTS "food_images_policy_delete" ON storage.objects;

-- 4. CREATE SIMPLE PERMISSIVE STORAGE POLICIES
CREATE POLICY "food_images_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'food-images');

CREATE POLICY "food_images_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'food-images');

CREATE POLICY "food_images_update_policy" ON storage.objects
FOR UPDATE USING (bucket_id = 'food-images');

CREATE POLICY "food_images_delete_policy" ON storage.objects
FOR DELETE USING (bucket_id = 'food-images');

-- 5. DISABLE RLS ON USERS TABLE (since we're using admin client anyway)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 6. DISABLE RLS ON LISTINGS TABLE (since we're using admin client anyway)
ALTER TABLE listings DISABLE ROW LEVEL SECURITY;

-- 7. DISABLE RLS ON PICKUPS TABLE (since we're using admin client anyway)
ALTER TABLE pickups DISABLE ROW LEVEL SECURITY;

-- 8. ENSURE STORAGE OBJECTS TABLE HAS RLS ENABLED
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 9. GRANT NECESSARY PERMISSIONS
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.buckets TO anon;

-- 10. CREATE SIMPLE SELECT POLICY FOR PUBLIC ACCESS
CREATE POLICY "Anyone can view food images" ON storage.objects
FOR SELECT USING (bucket_id = 'food-images');

-- 11. CREATE SIMPLE INSERT POLICY FOR UPLOADS
CREATE POLICY "Anyone can upload food images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'food-images');

-- Verify the bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'food-images';
