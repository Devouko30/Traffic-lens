-- Users table for local JWT auth
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  created_at    timestamptz default now()
);

-- Sessions table for refresh token tracking
create table if not exists public.user_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists idx_user_sessions_user_id on public.user_sessions(user_id);

-- Disable RLS for service-role access (backend uses service role key)
alter table public.users enable row level security;
alter table public.user_sessions enable row level security;

-- Allow service role full access
create policy "service_role_users" on public.users
  using (true) with check (true);

create policy "service_role_sessions" on public.user_sessions
  using (true) with check (true);
