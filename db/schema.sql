-- Amplify 850 newsletter — schema
-- Run once against your Postgres (Neon, Supabase, or Vercel Postgres).
--   psql "$DATABASE_URL" -f db/schema.sql

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- case-insensitive email

-- ---------------------------------------------------------------- subscribers

create table if not exists subscribers (
  id             uuid primary key default gen_random_uuid(),
  email          citext not null unique,
  segment        text not null
                 check (segment in ('fsu_student','lcs_family','community','business')),
  status         text not null default 'pending'
                 check (status in ('pending','confirmed','unsubscribed','bounced','complained')),

  -- double opt-in
  confirm_token       text,
  confirm_token_expires timestamptz,
  confirm_sent_at     timestamptz,
  confirmed_at        timestamptz,

  -- one-click unsubscribe (permanent, per subscriber)
  unsub_token    text not null,

  unsubscribed_at timestamptz,

  -- consent record — this is what proves the signup was real if anyone asks
  source         text,        -- footer | events | donate | about | join | conference
  age_confirmed  boolean not null default false,
  ip_hash        text,        -- sha256(ip + SALT); never store the raw IP
  user_agent     text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists subscribers_status_segment_idx
  on subscribers (status, segment);
create index if not exists subscribers_confirm_token_idx
  on subscribers (confirm_token) where confirm_token is not null;
create index if not exists subscribers_unsub_token_idx
  on subscribers (unsub_token);

-- ---------------------------------------------------------------- issues

create table if not exists issues (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  subject     text not null,
  preheader   text,
  body_md     text not null,
  segments    text[] not null default '{all}',
  status      text not null default 'draft'
              check (status in ('draft','sending','sent')),
  created_at  timestamptz not null default now(),
  queued_at   timestamptz,
  sent_at     timestamptz
);

-- ---------------------------------------------------------------- deliveries

create table if not exists deliveries (
  id            uuid primary key default gen_random_uuid(),
  issue_id      uuid not null references issues(id) on delete cascade,
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  status        text not null default 'queued'
                check (status in ('queued','sending','sent','failed','bounced','complained')),
  provider_id   text,
  error         text,
  attempts      int not null default 0,
  sent_at       timestamptz,
  created_at    timestamptz not null default now(),
  unique (issue_id, subscriber_id)
);

create index if not exists deliveries_queue_idx
  on deliveries (status, created_at) where status = 'queued';

-- ---------------------------------------------------------------- audit log

create table if not exists events (
  id            bigserial primary key,
  subscriber_id uuid references subscribers(id) on delete set null,
  type          text not null,   -- signup | confirm_sent | confirm | unsubscribe | bounce | complaint | rate_limited
  meta          jsonb not null default '{}'::jsonb,
  ip_hash       text,
  created_at    timestamptz not null default now()
);

create index if not exists events_type_created_idx on events (type, created_at desc);
create index if not exists events_ip_recent_idx on events (ip_hash, created_at desc);

-- ---------------------------------------------------------------- send budget
-- One row per calendar day so the cron can respect the provider's daily cap
-- even across concurrent invocations.

create table if not exists send_budget (
  day        date primary key,
  sent_count int not null default 0
);

-- ---------------------------------------------------------------- touch trigger

create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists subscribers_touch on subscribers;
create trigger subscribers_touch before update on subscribers
  for each row execute function touch_updated_at();
