insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-envases',
  'fotos-envases',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "fotos-envases: subir en su carpeta"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'fotos-envases'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "fotos-envases: ver las de su carpeta"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'fotos-envases'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "fotos-envases: borrar las de su carpeta"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'fotos-envases'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
