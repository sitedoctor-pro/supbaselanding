-- Run this once in Supabase SQL Editor.
-- It removes the public write permissions and keeps public read permissions.
-- Only authenticated users will be able to add, edit, or delete products/images.

-- Table: site_content
DROP POLICY IF EXISTS "public can insert site_content" ON public.site_content;
DROP POLICY IF EXISTS "public can update site_content" ON public.site_content;
DROP POLICY IF EXISTS "public can delete site_content" ON public.site_content;
DROP POLICY IF EXISTS "authenticated can insert site_content" ON public.site_content;
DROP POLICY IF EXISTS "authenticated can update site_content" ON public.site_content;
DROP POLICY IF EXISTS "authenticated can delete site_content" ON public.site_content;

CREATE POLICY "authenticated can insert site_content"
ON public.site_content
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated can update site_content"
ON public.site_content
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated can delete site_content"
ON public.site_content
FOR DELETE
TO authenticated
USING (true);

-- Storage: site-images bucket
DROP POLICY IF EXISTS "public can upload to site-images" ON storage.objects;
DROP POLICY IF EXISTS "public can update site-images" ON storage.objects;
DROP POLICY IF EXISTS "public can delete site-images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated can upload to site-images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated can update site-images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated can delete site-images" ON storage.objects;

CREATE POLICY "authenticated can upload to site-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "authenticated can update site-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'site-images')
WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "authenticated can delete site-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'site-images');
