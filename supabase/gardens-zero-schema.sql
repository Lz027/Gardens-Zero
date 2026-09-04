-- Gardens Zero — full schema for an external Supabase project.
-- Run once in Supabase Studio → SQL Editor → New query → Run.
-- Safe to re-run: everything is guarded with IF NOT EXISTS / OR REPLACE.

-- ─────────────────────────────── enums ───────────────────────────────
do $$ begin
  create type public.pillar as enum ('systems','career','projects','academics');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.entry_kind as enum ('done','in_progress','changed','unchanged','blocked','next');
exception when duplicate_object then null; end $$;

-- ───────────────────────── shared updated_at fn ──────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ─────────────────────────────── profiles ────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  bio text,
  headline text,
  links jsonb not null default '[]'::jsonb,
  wallpaper text,
  theme text not null default 'light',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
drop trigger if exists profiles_updated on public.profiles;
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─────────────────────────────── settings ────────────────────────────
create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'light',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.settings to authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
drop policy if exists "own settings" on public.settings;
create policy "own settings" on public.settings for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop trigger if exists settings_updated on public.settings;
create trigger settings_updated before update on public.settings
  for each row execute function public.set_updated_at();

-- ─────────────────────────────── pillars ─────────────────────────────
create table if not exists public.pillars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  label text not null,
  blurb text default '',
  accent text not null default 'iris',
  icon text not null default 'Boxes',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);
grant select, insert, update, delete on public.pillars to authenticated;
grant all on public.pillars to service_role;
alter table public.pillars enable row level security;
drop policy if exists "own pillars" on public.pillars;
create policy "own pillars" on public.pillars for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ───────────────────────────── note folders ──────────────────────────
create table if not exists public.note_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Folder',
  pos_x integer not null default 40,
  pos_y integer not null default 40,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.note_folders to authenticated;
grant all on public.note_folders to service_role;
alter table public.note_folders enable row level security;
drop policy if exists "own note folders" on public.note_folders;
create policy "own note folders" on public.note_folders for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ──────────────────────────────── notes ──────────────────────────────
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled note',
  body text not null default '',
  pillar public.pillar,
  pillar_id uuid references public.pillars(id) on delete set null,
  folder_id uuid references public.note_folders(id) on delete set null,
  pos_x integer not null default 80,
  pos_y integer not null default 80,
  width integer not null default 380,
  height integer not null default 300,
  z_index integer not null default 1,
  is_open boolean not null default true,
  is_minimized boolean not null default false,
  is_maximized boolean not null default false,
  pinned boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notes to authenticated;
grant all on public.notes to service_role;
alter table public.notes enable row level security;
drop policy if exists "own notes" on public.notes;
create policy "own notes" on public.notes for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at before update on public.notes
  for each row execute function public.set_updated_at();

-- ───────────────────────────────── apps ──────────────────────────────
create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text not null default '',
  icon_url text,
  accent text,
  position integer not null default 0,
  is_folder boolean not null default false,
  parent_id uuid references public.apps(id) on delete set null,
  is_favorite boolean not null default false,
  share_count integer not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.apps to authenticated;
grant all on public.apps to service_role;
alter table public.apps enable row level security;
drop policy if exists "own apps" on public.apps;
create policy "own apps" on public.apps for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ───────────────────────────── pillar entries ────────────────────────
create table if not exists public.pillar_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pillar public.pillar not null,
  kind public.entry_kind not null default 'in_progress',
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.pillar_entries to authenticated;
grant all on public.pillar_entries to service_role;
alter table public.pillar_entries enable row level security;
drop policy if exists "own pillar entries" on public.pillar_entries;
create policy "own pillar entries" on public.pillar_entries for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop trigger if exists pillar_entries_updated on public.pillar_entries;
create trigger pillar_entries_updated before update on public.pillar_entries
  for each row execute function public.set_updated_at();

-- ──────────────────────────────── events ─────────────────────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  pillar public.pillar,
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;
drop policy if exists "own events" on public.events;
create policy "own events" on public.events for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ───────────────────────────── notifications ─────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  kind text not null default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
drop policy if exists "own notifications" on public.notifications;
create policy "own notifications" on public.notifications for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────── recents ─────────────────────────────
create table if not exists public.recents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  icon_url text,
  visited_at timestamptz not null default now()
);
grant select, insert, update, delete on public.recents to authenticated;
grant all on public.recents to service_role;
alter table public.recents enable row level security;
drop policy if exists "own recents" on public.recents;
create policy "own recents" on public.recents for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ────────────────── new user: profile, settings, pillars ─────────────
create or replace function public.seed_default_pillars()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.pillars (user_id, slug, label, blurb, accent, icon, sort_order)
  values
    (new.id,'systems','Systems','The sync layer. Rules, reset logic, structure.','iris','Boxes',0),
    (new.id,'career','Career','Professional identity, credibility, income path.','teal','Briefcase',1),
    (new.id,'projects','Projects','Execution, outputs, proof, assets, build work.','iris','Hammer',2),
    (new.id,'academics','Academics','Study direction, requirements, academic progress.','teal','GraduationCap',3)
  on conflict (user_id, slug) do nothing;
  return new;
end; $$;
revoke execute on function public.seed_default_pillars() from public, anon, authenticated;

drop trigger if exists seed_pillars_on_profile on public.profiles;
create trigger seed_pillars_on_profile after insert on public.profiles
  for each row execute function public.seed_default_pillars();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''), '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  insert into public.settings (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end; $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill for accounts that already exist in this project.
insert into public.profiles (id, email, display_name)
select u.id, u.email, split_part(coalesce(u.email,''),'@',1)
from auth.users u
on conflict (id) do nothing;
