-- ============================================================================
-- SIMPLIFIED RLS FIX - Only operations that don't require table ownership
-- Run this script in your Supabase SQL Editor
-- ============================================================================

-- 1. CREATE OR REPLACE THE BUCKET (this should work)
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) VALUES (
  'food-images',
  'food-images',
  true,
  52428800,
  '{"image/jpeg","image/jpg","image/png","image/webp"}'
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = '{"image/jpeg","image/jpg","image/png","image/webp"}';

-- 2. DROP EXISTING POLICIES ON STORAGE.OBJECTS (if they exist)
DROP POLICY IF EXISTS "Public Access for food-images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "food_images_policy_select" ON storage.objects;
DROP POLICY IF EXISTS "food_images_policy_insert" ON storage.objects;
DROP POLICY IF EXISTS "food_images_policy_update" ON storage.objects;
DROP POLICY IF EXISTS "food_images_policy_delete" ON storage.objects;
DROP POLICY IF EXISTS "food_images_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "food_images_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "food_images_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "food_images_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view food images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload food images" ON storage.objects;

-- 3. CREATE VERY PERMISSIVE STORAGE POLICIES
CREATE POLICY "food_images_public_select" ON storage.objects
FOR SELECT USING (bucket_id = 'food-images');

CREATE POLICY "food_images_public_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'food-images');

-- 4. DISABLE RLS ON YOUR CUSTOM TABLES (this should work)
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pickups DISABLE ROW LEVEL SECURITY;

-- 5. VERIFY BUCKET EXISTS
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'food-images';

-- 6. VERIFY POLICIES EXIST
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%food_images%';
