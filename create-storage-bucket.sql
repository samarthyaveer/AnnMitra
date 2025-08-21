-- Create the food-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'food-images',
  'food-images', 
  true,
  52428800, -- 50MB limit
  '{"image/*"}'
);

-- Set up RLS policies for the bucket
CREATE POLICY "Public Access for food-images bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'food-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'food-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (bucket_id = 'food-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (bucket_id = 'food-images' AND auth.role() = 'authenticated');
