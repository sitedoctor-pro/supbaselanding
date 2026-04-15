-- شغّل هاد الملف مرة وحدة من SQL Editor فـ Supabase
-- باش التعديل والحذف يشتغلو فالدashboard

create policy "public can update site_content"
on public.site_content
for update
to public
using (true)
with check (true);

create policy "public can delete site_content"
on public.site_content
for delete
to public
using (true);

create policy "public can update site-images"
on storage.objects
for update
to public
using (bucket_id = 'site-images')
with check (bucket_id = 'site-images');

create policy "public can delete site-images"
on storage.objects
for delete
to public
using (bucket_id = 'site-images');
