-- GoldOak / Super Agent schema. Idempotent: safe to run repeatedly.
-- Every statement is CREATE ... IF NOT EXISTS or an additive ALTER.

CREATE TABLE IF NOT EXISTS organizations (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  short_name  text NOT NULL,
  phone       text NOT NULL,
  email       text NOT NULL,
  whatsapp    text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id              text PRIMARY KEY,
  role            text NOT NULL,
  organization_id text REFERENCES organizations(id),
  name            text NOT NULL,
  email           text NOT NULL UNIQUE,
  phone           text UNIQUE,
  password_hash   text NOT NULL,
  title           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_seen_at    timestamptz
);
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'agency', 'client'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_opt_in boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS clients (
  id              text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES organizations(id),
  user_id         text UNIQUE REFERENCES users(id),
  name            text NOT NULL,
  type            text NOT NULL CHECK (type IN ('individual', 'sme', 'corporate')),
  phone           text,
  email           text,
  stage           text NOT NULL DEFAULT 'understand'
                  CHECK (stage IN ('understand', 'solve', 'compare', 'implement', 'support', 'review')),
  adviser_name    text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS clients_org_idx ON clients(organization_id);

CREATE TABLE IF NOT EXISTS policies (
  id              text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES organizations(id),
  client_id       text NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  insurer         text NOT NULL,
  product         text NOT NULL,
  policy_number   text NOT NULL,
  sum_insured     bigint,
  premium         bigint NOT NULL,
  start_date      date NOT NULL,
  expiry_date     date NOT NULL,
  status          text NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'renewal-due', 'lapsed', 'cancelled')),
  key_exclusions  text
);
CREATE INDEX IF NOT EXISTS policies_client_idx ON policies(client_id);

CREATE TABLE IF NOT EXISTS quote_requests (
  id               text PRIMARY KEY,
  organization_id  text NOT NULL REFERENCES organizations(id),
  client_id        text NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  reference        text NOT NULL,
  product          text NOT NULL,
  stage            text NOT NULL DEFAULT 'requested'
                   CHECK (stage IN ('requested', 'compared', 'proposed', 'accepted', 'placed', 'declined')),
  premium_estimate bigint,
  notes            text,
  channel          text NOT NULL DEFAULT 'web',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'web';
CREATE INDEX IF NOT EXISTS quote_requests_client_idx ON quote_requests(client_id);

CREATE TABLE IF NOT EXISTS quote_submissions (
  id               text PRIMARY KEY,
  organization_id  text NOT NULL REFERENCES organizations(id),
  quote_request_id text NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  insurer          text NOT NULL,
  status           text NOT NULL DEFAULT 'awaiting'
                   CHECK (status IN ('awaiting', 'received', 'clarification', 'ready', 'declined')),
  premium          bigint,
  sent_at          timestamptz NOT NULL DEFAULT now(),
  responded_at     timestamptz
);

CREATE TABLE IF NOT EXISTS claims (
  id               text PRIMARY KEY,
  organization_id  text NOT NULL REFERENCES organizations(id),
  client_id        text NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  policy_id        text REFERENCES policies(id),
  reference        text NOT NULL,
  insurer          text NOT NULL,
  product          text NOT NULL,
  stage            text NOT NULL DEFAULT 'notified'
                   CHECK (stage IN ('notified', 'registered', 'documenting', 'with-insurer', 'assessed', 'offer', 'settled', 'closed')),
  amount           bigint,
  description      text,
  incident_date    date,
  channel          text NOT NULL DEFAULT 'web',
  next_update_due  date,
  notified_at      timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS incident_date date;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'web';

CREATE TABLE IF NOT EXISTS tasks (
  id               text PRIMARY KEY,
  organization_id  text NOT NULL REFERENCES organizations(id),
  client_id        text REFERENCES clients(id) ON DELETE CASCADE,
  client_name      text NOT NULL,
  type             text NOT NULL,
  insurer          text,
  product          text NOT NULL,
  summary          text NOT NULL,
  timing           text NOT NULL,
  sla              text NOT NULL CHECK (sla IN ('on-track', 'at-risk', 'overdue', 'needs-review')),
  priority         integer NOT NULL DEFAULT 50,
  due_today        boolean NOT NULL DEFAULT false,
  amount           bigint,
  reference        text,
  action_kind      text NOT NULL,
  action_label     text NOT NULL,
  completed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tasks_org_open_idx ON tasks(organization_id) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS tasks_reference_idx ON tasks(reference);

CREATE TABLE IF NOT EXISTS activity (
  id               text PRIMARY KEY,
  organization_id  text NOT NULL REFERENCES organizations(id),
  client_id        text REFERENCES clients(id) ON DELETE CASCADE,
  client_name      text NOT NULL,
  kind             text NOT NULL,
  title            text NOT NULL,
  at               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS activity_org_at_idx ON activity(organization_id, at DESC);

-- Every message a person should see, on the site and (when opted in and reachable) on WhatsApp.
CREATE TABLE IF NOT EXISTS notifications (
  id               text PRIMARY KEY,
  organization_id  text NOT NULL REFERENCES organizations(id),
  user_id          text REFERENCES users(id) ON DELETE CASCADE,
  client_id        text REFERENCES clients(id) ON DELETE CASCADE,
  kind             text NOT NULL,
  title            text NOT NULL,
  body             text NOT NULL,
  reference        text,
  whatsapp_status  text NOT NULL DEFAULT 'skipped' CHECK (whatsapp_status IN ('skipped', 'sent', 'failed')),
  read_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS notifications_reference_idx ON notifications(reference) WHERE reference IS NOT NULL;

-- Multi-step WhatsApp conversations (report a claim, request a quote).
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  phone        text PRIMARY KEY,
  flow         text,
  step         text,
  data         jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id           text PRIMARY KEY,
  phone        text NOT NULL,
  user_id      text REFERENCES users(id),
  direction    text NOT NULL CHECK (direction IN ('in', 'out')),
  body         text NOT NULL,
  at           timestamptz NOT NULL DEFAULT now()
);

-- Webhook idempotency (OpenWA delivers at least once).
CREATE TABLE IF NOT EXISTS processed_webhooks (
  key          text PRIMARY KEY,
  received_at  timestamptz NOT NULL DEFAULT now()
);
