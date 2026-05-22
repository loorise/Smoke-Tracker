create policy "smoking_events_delete_anon"
  on public.smoking_events
  for delete
  to anon
  using (true);
