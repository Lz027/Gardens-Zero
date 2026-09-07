drop policy if exists "brand assets owner read" on storage.objects;
create policy "brand assets owner read" on storage.objects for select to authenticated
  using (bucket_id = 'brand-assets' and owner = auth.uid());

drop policy if exists "brand assets owner write" on storage.objects;
create policy "brand assets owner write" on storage.objects for insert to authenticated
  with check (bucket_id = 'brand-assets' and owner = auth.uid());

drop policy if exists "brand assets owner delete" on storage.objects;
create policy "brand assets owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'brand-assets' and owner = auth.uid());