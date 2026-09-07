/**
 * GoldOak / Super Agent schema. Embedded as a string (not read from disk) so it
 * ships inside every serverless bundle, including server actions.
 * Idempotent: every statement is CREATE ... IF NOT EXISTS or an additive ALTER.
 */
export const SCHEMA_SQL = `
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
-- ---------- Multi-tenancy, conversations, RBAC (v2) ----------
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS greeting text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS licence_label text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS organizations_code_idx ON organizations (lower(code)) WHERE code IS NOT NULL;
UPDATE organizations SET code = 'GOLDOAK' WHERE id = 'org_goldoak' AND code IS NULL;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'agency_admin', 'agency', 'client'));

-- One row per WhatsApp number: which organisation it talks to, the current workflow, and whether a person has taken over.
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
  phone             text PRIMARY KEY,
  organization_id   text REFERENCES organizations(id),
  user_id           text REFERENCES users(id) ON DELETE SET NULL,
  display_name      text,
  mode              text NOT NULL DEFAULT 'ai' CHECK (mode IN ('ai', 'human')),
  assigned_user_id  text REFERENCES users(id) ON DELETE SET NULL,
  workflow          text,
  step              integer,
  data              jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_inbound_at   timestamptz,
  handoff_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS whatsapp_contacts_org_idx ON whatsapp_contacts(organization_id, updated_at DESC);

-- Every message in and out, per contact. The agency reads these; the AI reads a window of them.
CREATE TABLE IF NOT EXISTS conversation_messages (
  id               text PRIMARY KEY,
  phone            text NOT NULL,
  organization_id  text REFERENCES organizations(id),
  user_id          text REFERENCES users(id) ON DELETE SET NULL,
  direction        text NOT NULL CHECK (direction IN ('in', 'out')),
  role             text NOT NULL CHECK (role IN ('user', 'assistant', 'agent', 'system')),
  body             text NOT NULL,
  at               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS conversation_messages_phone_idx ON conversation_messages(phone, at DESC);
CREATE INDEX IF NOT EXISTS conversation_messages_org_idx ON conversation_messages(organization_id, at DESC);

-- Questions answered by the consultation assistant (web or WhatsApp), kept so answers improve and can be reviewed.
CREATE TABLE IF NOT EXISTS consultations (
  id               text PRIMARY KEY,
  organization_id  text REFERENCES organizations(id),
  user_id          text REFERENCES users(id) ON DELETE SET NULL,
  phone            text,
  channel          text NOT NULL DEFAULT 'whatsapp',
  question         text NOT NULL,
  answer           text NOT NULL,
  source           text NOT NULL DEFAULT 'catalogue',
  at               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS consultations_org_idx ON consultations(organization_id, at DESC);

-- Generated documents (PDFs) so numbers are stable and downloads can be audited.
CREATE TABLE IF NOT EXISTS documents (
  id               text PRIMARY KEY,
  organization_id  text NOT NULL REFERENCES organizations(id),
  client_id        text REFERENCES clients(id) ON DELETE CASCADE,
  user_id          text REFERENCES users(id) ON DELETE SET NULL,
  type             text NOT NULL,
  number           text NOT NULL,
  title            text NOT NULL,
  subject_id       text,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS documents_number_idx ON documents(number);

-- Who did what. Sensitive operations write here.
CREATE TABLE IF NOT EXISTS audit_log (
  id               text PRIMARY KEY,
  organization_id  text,
  actor_user_id    text,
  action           text NOT NULL,
  target           text,
  detail           jsonb,
  at               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_log_org_idx ON audit_log(organization_id, at DESC);
`
