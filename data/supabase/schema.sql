-- Run this in Supabase SQL Editor once.
-- This schema is designed for server-side access using SUPABASE_SERVICE_ROLE_KEY.

create table if not exists app_users (
  user_id text primary key,
  username text not null unique,
  email text not null unique,
  is_creator boolean not null default false,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists auth_tokens (
  token text primary key,
  user_id text not null references app_users(user_id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_auth_tokens_user_id on auth_tokens(user_id);

create table if not exists exam_drafts (
  attempt_id text primary key,
  user_id text not null references app_users(user_id) on delete cascade,
  question_ids jsonb not null,
  started_at timestamptz not null default now()
);

create index if not exists idx_exam_drafts_user_id on exam_drafts(user_id);

create table if not exists exam_attempts (
  attempt_id text primary key,
  draft_id text,
  user_id text not null references app_users(user_id) on delete cascade,
  score_pct numeric(5,2) not null,
  correct_count integer not null,
  duration_sec integer not null default 0,
  passed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_exam_attempts_user_id on exam_attempts(user_id);
create index if not exists idx_exam_attempts_score_time on exam_attempts(score_pct desc, duration_sec asc);

create table if not exists sim_active_sessions (
  session_id text primary key,
  user_id text not null references app_users(user_id) on delete cascade,
  route_id text not null,
  events jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- Migration-safe upgrades for existing projects:
alter table if exists sim_active_sessions
  add column if not exists last_seen_at timestamptz;

update sim_active_sessions
set last_seen_at = coalesce(last_seen_at, started_at, now())
where last_seen_at is null;

alter table if exists sim_active_sessions
  alter column last_seen_at set default now();

alter table if exists sim_active_sessions
  alter column last_seen_at set not null;

create index if not exists idx_sim_active_sessions_user_id on sim_active_sessions(user_id);
create index if not exists idx_sim_active_sessions_last_seen_at on sim_active_sessions(last_seen_at desc);

-- Keep only the newest active session per user before enforcing uniqueness.
with ranked as (
  select
    session_id,
    row_number() over (
      partition by user_id
      order by coalesce(last_seen_at, started_at) desc, started_at desc, session_id desc
    ) as rn
  from sim_active_sessions
)
delete from sim_active_sessions s
using ranked r
where s.session_id = r.session_id
  and r.rn > 1;

create unique index if not exists uq_sim_active_sessions_user_id on sim_active_sessions(user_id);

-- Optional helper for cron/manual cleanup.
create or replace function cleanup_stale_sim_active_sessions(max_age_minutes integer default 15)
returns integer
language plpgsql
as $$
declare
  removed_count integer := 0;
begin
  delete from sim_active_sessions
  where last_seen_at < (now() - make_interval(mins => greatest(1, max_age_minutes)));
  get diagnostics removed_count = row_count;
  return removed_count;
end;
$$;

create table if not exists sim_sessions (
  session_id text primary key,
  user_id text not null references app_users(user_id) on delete cascade,
  route_id text not null,
  score_pct numeric(5,2) not null,
  critical_fail boolean not null default false,
  fail_reason text,
  duration_sec integer not null default 0,
  penalties jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_sim_sessions_user_id on sim_sessions(user_id);
create index if not exists idx_sim_sessions_score_fail_time on sim_sessions(score_pct desc, critical_fail asc, duration_sec asc);

create table if not exists maps (
  map_id text primary key,
  route_id text not null check (route_id in ('A','B')),
  name text not null,
  version integer not null,
  route jsonb not null,
  created_by text not null references app_users(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  published_at timestamptz not null default now()
);

create index if not exists idx_maps_route_id_version on maps(route_id, version desc);

create table if not exists active_route_maps (
  route_id text primary key check (route_id in ('A','B')),
  map_id text not null references maps(map_id) on delete cascade,
  updated_at timestamptz not null default now()
);
