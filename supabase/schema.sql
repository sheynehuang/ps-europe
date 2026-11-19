-- PS. Europe — Supabase setup. Paste into Supabase → SQL Editor → Run (once).
-- Every collection (items, places, expenses…) is stored as JSON rows in one table, mirroring src/data/seed.js.

-- 1. Who may use the trip. crew_id links an email to a person in the app (u1 = Pei-Ti, u2 = Sheyne).
create table members (
  email text primary key,
  crew_id text not null
);

-- 2. All trip data.
create table rows (
  col text not null,          -- collection name: items, places, expenses, trip, settings, log…
  id text not null,
  data jsonb not null,
  updated_at timestamptz default now(),
  primary key (col, id)
);

-- 3. Only listed members can read or write anything.
create function is_member() returns boolean
language sql security definer stable set search_path = public as
$$ select exists (select 1 from members where email = lower(auth.jwt() ->> 'email')) $$;

alter table members enable row level security;
-- Each person can read only their own row, so emails stay private from the rest of the crew.
create policy "members read own" on members for select using (email = lower(auth.jwt() ->> 'email'));
create policy "members invite" on members for insert with check (is_member());

alter table rows enable row level security;
create policy "members all" on rows for all using (is_member()) with check (is_member());

-- 4. Live sync between phones.
alter publication supabase_realtime add table rows;

-- 5. Photo storage. Files get random names; anyone with a photo's exact link can view it.
insert into storage.buckets (id, name, public) values ('photos', 'photos', true);
create policy "members upload photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and public.is_member());

-- 6. ✏️ Put your real emails here (lowercase), then run.
insert into members (email, crew_id) values
  ('pei@example.com', 'u1'),
  ('sheyne@example.com', 'u2');
