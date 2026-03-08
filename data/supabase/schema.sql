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
  started_at timestamptz not null default now()
);

create index if not exists idx_sim_active_sessions_user_id on sim_active_sessions(user_id);

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
