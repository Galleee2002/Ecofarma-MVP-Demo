insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recetas-medicas',
  'recetas-medicas',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "recetas-medicas: subir en su carpeta"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'recetas-medicas'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "recetas-medicas: ver las de su carpeta"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'recetas-medicas'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "recetas-medicas: borrar las de su carpeta"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'recetas-medicas'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
