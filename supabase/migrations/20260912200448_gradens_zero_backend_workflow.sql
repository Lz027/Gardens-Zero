alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'editor', 'admin'));

create or replace function public.is_opportunity_editor()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('editor', 'admin'));
$$;
revoke execute on function public.is_opportunity_editor() from public, anon;
grant execute on function public.is_opportunity_editor() to authenticated;

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(), title text not null, provider text not null,
  description text not null default '', country text not null default '', city text,
  level text not null default 'masters', opportunity_type text not null default 'scholarship',
  funding_type text not null default 'fully_funded', official_url text not null default '',
  deadline timestamptz, is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint opportunities_level_check check (level in ('bachelors','masters','phd','postdoc','professional','other')),
  constraint opportunities_type_check check (opportunity_type in ('scholarship','fellowship','grant','internship','job','program','other')),
  constraint opportunities_funding_check check (funding_type in ('fully_funded','partially_funded','self_funded','paid','unpaid','other'))
);
create table if not exists public.saved_opportunities (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(), unique (user_id, opportunity_id)
);
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  status text not null default 'planning', notes text not null default '', next_action text,
  next_action_due_at timestamptz, submitted_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (user_id, opportunity_id),
  constraint applications_status_check check (status in ('planning','preparing','submitted','interview','accepted','rejected','withdrawn'))
);
create index if not exists opportunities_active_deadline_idx on public.opportunities (is_active, deadline);
create index if not exists opportunities_created_by_idx on public.opportunities (created_by);
create index if not exists saved_opportunities_user_idx on public.saved_opportunities (user_id, created_at desc);
create index if not exists applications_user_status_idx on public.applications (user_id, status, updated_at desc);
create index if not exists applications_deadline_idx on public.applications (user_id, next_action_due_at);

drop trigger if exists opportunities_updated on public.opportunities;
create trigger opportunities_updated before update on public.opportunities for each row execute function public.set_updated_at();
drop trigger if exists applications_updated on public.applications;
create trigger applications_updated before update on public.applications for each row execute function public.set_updated_at();

grant select on public.opportunities to anon, authenticated;
grant insert, update, delete on public.opportunities to authenticated;
grant select, insert, update, delete on public.saved_opportunities, public.applications to authenticated;
grant all on public.opportunities, public.saved_opportunities, public.applications to service_role;
alter table public.opportunities enable row level security;
alter table public.saved_opportunities enable row level security;
alter table public.applications enable row level security;

drop policy if exists "read active opportunities" on public.opportunities;
create policy "read active opportunities" on public.opportunities for select to anon, authenticated using (is_active = true or public.is_opportunity_editor());
drop policy if exists "edit opportunities" on public.opportunities;
create policy "edit opportunities" on public.opportunities for all to authenticated using (public.is_opportunity_editor()) with check (public.is_opportunity_editor());
drop policy if exists "own saved opportunities" on public.saved_opportunities;
create policy "own saved opportunities" on public.saved_opportunities for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own applications" on public.applications;
create policy "own applications" on public.applications for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.protect_profile_role() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'profile role cannot be changed by the authenticated user';
  end if;
  return new;
end;
$$;
revoke execute on function public.protect_profile_role() from public, anon, authenticated;
drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role before update on public.profiles for each row execute function public.protect_profile_role();

insert into public.opportunities (title, provider, description, country, city, level, opportunity_type, funding_type, official_url, deadline, is_active) values
('Development seed — Global Graduate Scholarship', 'Gardens Zero Development Data', 'Clearly labeled development opportunity for local testing.', 'Global', null, 'masters', 'scholarship', 'fully_funded', 'https://example.com/development-scholarship', now() + interval '90 days', true),
('Development seed — Research Fellowship', 'Gardens Zero Development Data', 'Clearly labeled development opportunity for testing application statuses.', 'Germany', 'Berlin', 'phd', 'fellowship', 'partially_funded', 'https://example.com/development-fellowship', now() + interval '120 days', true),
('Development seed — Product Internship', 'Gardens Zero Development Data', 'Clearly labeled development opportunity for testing saved opportunities.', 'Remote', null, 'professional', 'internship', 'paid', 'https://example.com/development-internship', now() + interval '60 days', true)
on conflict do nothing;
