-- PS. Europe — Supabase schema (run in the SQL editor when you're ready to go multi-user).
-- Mirrors the collections in src/data/seed.js. Every row belongs to a trip; members of a trip can read/write it.

create table trips (
  id uuid primary key default gen_random_uuid(),
  name text not null, start_date date not null, end_date date not null,
  budget_twd numeric default 0, created_at timestamptz default now()
);

create table trip_members (
  trip_id uuid references trips on delete cascade,
  user_id uuid references auth.users on delete cascade,
  name text, emoji text, color text, role text,
  primary key (trip_id, user_id)
);

create table invites (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips on delete cascade, email text not null, status text default 'pending'
);

-- Shared audit columns: created_by / updated_by / updated_at power "added by" / "edited by".
create table cities (
  id text, trip_id uuid references trips on delete cascade, name text, country text, flag text,
  start_date date, end_date date, lat float8, lng float8, tone text, primary key (trip_id, id)
);

create table items (
  id uuid primary key default gen_random_uuid(), trip_id uuid references trips on delete cascade,
  type text check (type in ('activity','flight','train','hotel','reservation')),
  title text not null, date date, time text, city_id text, place_id uuid,
  location text, notes text, cost numeric, currency text,
  "from" text, "to" text, number text, ref text,
  created_by uuid references auth.users, updated_by uuid references auth.users, updated_at timestamptz default now()
);

create table places (
  id uuid primary key default gen_random_uuid(), trip_id uuid references trips on delete cascade,
  name text not null, category text, city_id text, lat float8, lng float8, visited boolean default false, notes text,
  created_by uuid references auth.users, updated_by uuid references auth.users, updated_at timestamptz default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(), trip_id uuid references trips on delete cascade,
  title text not null, amount numeric not null, currency text not null,
  rate numeric not null,              -- TWD per 1 unit of currency at time of payment
  category text, date date, city_id text,
  paid_by uuid references auth.users, split uuid[] not null,
  created_by uuid references auth.users, updated_by uuid references auth.users, updated_at timestamptz default now()
);

create table memories (
  id uuid primary key default gen_random_uuid(), trip_id uuid references trips on delete cascade,
  date date, city_id text, title text, text text, mood text,
  photos text[] default '{}',         -- Supabase Storage paths (not data URLs)
  created_by uuid references auth.users, updated_by uuid references auth.users, updated_at timestamptz default now()
);

create table docs (
  id uuid primary key default gen_random_uuid(), trip_id uuid references trips on delete cascade,
  kind text, title text, detail text, notes text,
  created_by uuid references auth.users, updated_by uuid references auth.users, updated_at timestamptz default now()
);

create table emergency (
  id uuid primary key default gen_random_uuid(), trip_id uuid references trips on delete cascade,
  label text, value text, notes text,
  created_by uuid references auth.users, updated_by uuid references auth.users, updated_at timestamptz default now()
);

create table checklist (
  id uuid primary key default gen_random_uuid(), trip_id uuid references trips on delete cascade,
  "group" text, text text, done boolean default false
);

create table activity_log (
  id uuid primary key default gen_random_uuid(), trip_id uuid references trips on delete cascade,
  user_id uuid references auth.users, action text, col text, title text, at timestamptz default now()
);

-- Row-level security: only trip members can touch a trip's rows.
create function is_member(t uuid) returns boolean language sql security definer stable as
  $$ select exists (select 1 from trip_members where trip_id = t and user_id = auth.uid()) $$;

alter table trips enable row level security;
create policy "members" on trips for all using (is_member(id)) with check (is_member(id));

alter table trip_members enable row level security;
create policy "members" on trip_members for all using (is_member(trip_id)) with check (is_member(trip_id));

do $$ declare t text; begin
  foreach t in array array['invites','cities','items','places','expenses','memories','docs','emergency','checklist','activity_log'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "members" on %I for all using (is_member(trip_id)) with check (is_member(trip_id))', t);
  end loop;
end $$;
-- Note: creating a trip + adding yourself as its first member needs an RPC or service-role insert,
-- since no one is a member yet when the trip row is created.
