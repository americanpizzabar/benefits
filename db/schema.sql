-- MyPerks schema for Neon Postgres.
-- Auth is handled by Auth.js (password-only) against the `users` table below.
-- There is no RLS: every query is scoped to the session user in application code.
-- Safe to run more than once.

create extension if not exists pgcrypto;

do $$ begin
  create type scene as enum ('eat', 'move_learn', 'relax_play', 'life_events');
exception when duplicate_object then null; end $$;

do $$ begin
  create type doc_status as enum ('uploaded', 'parsing', 'parsed', 'failed');
exception when duplicate_object then null; end $$;

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  display_name  text,
  locale        text not null default 'en',
  currency      text not null default 'JPY',
  lifestyle     jsonb not null default '{}'::jsonb,
  home_area     text,
  onboarded     boolean not null default false,
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists benefit_documents (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null,
  filename     text,
  status       doc_status not null default 'uploaded',
  uploaded_by  uuid references users(id) on delete set null,
  error        text,
  created_at   timestamptz not null default now(),
  parsed_at    timestamptz
);

create table if not exists benefits (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid references benefit_documents(id) on delete set null,
  scene        scene not null,
  title        text not null,
  action       text,
  vendor       text,
  amount       numeric,
  discount_pct numeric,
  currency     text not null default 'JPY',
  details      text,
  lat          double precision,
  lng          double precision,
  area         text,
  published    boolean not null default true,
  base_locale  text not null default 'en',
  created_at   timestamptz not null default now()
);

create table if not exists benefit_translations (
  benefit_id  uuid not null references benefits(id) on delete cascade,
  locale      text not null,
  title       text,
  action      text,
  details     text,
  context_tip text,
  created_at  timestamptz not null default now(),
  primary key (benefit_id, locale)
);

create table if not exists savings_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  benefit_id   uuid not null references benefits(id) on delete cascade,
  amount_saved numeric not null default 0,
  used_at      timestamptz not null default now()
);

create table if not exists badges (
  code        text primary key,
  name        text not null,
  description text,
  icon        text,
  criteria    jsonb not null default '{}'::jsonb,
  sort_order  integer not null default 0
);

create table if not exists user_badges (
  user_id     uuid not null references users(id) on delete cascade,
  badge_code  text not null references badges(code) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, badge_code)
);

create table if not exists reviews (
  id           uuid primary key default gen_random_uuid(),
  benefit_id   uuid not null references benefits(id) on delete cascade,
  user_id      uuid not null references users(id) on delete cascade,
  rating       integer not null check (rating between 1 and 5),
  body         text not null,
  locale       text not null default 'en',
  translations jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create table if not exists buddy_posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  benefit_id uuid references benefits(id) on delete set null,
  title      text not null,
  body       text,
  when_at    timestamptz,
  status     text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists idx_benefits_scene on benefits(scene);
create index if not exists idx_savings_user on savings_log(user_id);
create index if not exists idx_reviews_benefit on reviews(benefit_id);
create index if not exists idx_translations_locale on benefit_translations(locale);
