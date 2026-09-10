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

-- Legacy bot tables, replaced by whatsapp_contacts and conversation_messages (v2).
DROP TABLE IF EXISTS whatsapp_sessions;
DROP TABLE IF EXISTS whatsapp_messages;

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

-- ---------- v3: agencies self-onboard, businesses, uploads/OCR, enquiries, jobs, memory ----------
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_path text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS approved_at timestamptz;

ALTER TABLE whatsapp_contacts ADD COLUMN IF NOT EXISTS memory jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE whatsapp_contacts ADD COLUMN IF NOT EXISTS consented_at timestamptz;
ALTER TABLE whatsapp_contacts ADD COLUMN IF NOT EXISTS inbound_count integer NOT NULL DEFAULT 0;
ALTER TABLE whatsapp_contacts ADD COLUMN IF NOT EXISTS summarised_at integer NOT NULL DEFAULT 0;

ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Businesses an agency serves or knows about. Clients can search and claim them.
CREATE TABLE IF NOT EXISTS businesses (
  id                 text PRIMARY KEY,
  organization_id    text NOT NULL REFERENCES organizations(id),
  client_id          text REFERENCES clients(id) ON DELETE SET NULL,
  name               text NOT NULL,
  registration_no    text,
  sector             text,
  phone              text,
  email              text,
  address            text,
  verified           boolean NOT NULL DEFAULT false,
  created_by         text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS businesses_org_name_idx ON businesses(organization_id, lower(name));

CREATE TABLE IF NOT EXISTS business_claims (
  id                 text PRIMARY KEY,
  organization_id    text NOT NULL REFERENCES organizations(id),
  business_id        text NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  client_id          text REFERENCES clients(id) ON DELETE SET NULL,
  user_id            text REFERENCES users(id) ON DELETE SET NULL,
  phone              text,
  reference          text NOT NULL UNIQUE,
  applicant_name     text NOT NULL,
  relationship       text NOT NULL,
  verification       text,
  status             text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_note        text,
  reviewed_by        text,
  reviewed_at        timestamptz,
  channel            text NOT NULL DEFAULT 'whatsapp',
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS business_claims_org_idx ON business_claims(organization_id, status, created_at DESC);

-- Files people send us (WhatsApp or web), what we read from them, and whether they confirmed it.
CREATE TABLE IF NOT EXISTS uploads (
  id                 text PRIMARY KEY,
  organization_id    text NOT NULL REFERENCES organizations(id),
  client_id          text REFERENCES clients(id) ON DELETE SET NULL,
  user_id            text REFERENCES users(id) ON DELETE SET NULL,
  phone              text,
  source             text NOT NULL DEFAULT 'whatsapp',
  storage_path       text NOT NULL,
  filename           text NOT NULL,
  mimetype           text NOT NULL,
  size_bytes         integer NOT NULL DEFAULT 0,
  kind               text NOT NULL DEFAULT 'other',
  caption            text,
  ocr_status         text NOT NULL DEFAULT 'queued' CHECK (ocr_status IN ('queued', 'processing', 'done', 'failed', 'skipped')),
  ocr_text           text,
  extracted          jsonb,
  confirmed_at       timestamptz,
  confirmed_data     jsonb,
  claim_id           text REFERENCES claims(id) ON DELETE SET NULL,
  reviewed_by        text,
  reviewed_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS uploads_org_idx ON uploads(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS uploads_client_idx ON uploads(client_id, created_at DESC);

CREATE TABLE IF NOT EXISTS enquiries (
  id                 text PRIMARY KEY,
  organization_id    text NOT NULL REFERENCES organizations(id),
  client_id          text REFERENCES clients(id) ON DELETE SET NULL,
  user_id            text REFERENCES users(id) ON DELETE SET NULL,
  phone              text,
  reference          text NOT NULL UNIQUE,
  subject            text NOT NULL,
  body               text NOT NULL,
  status             text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  answer             text,
  answered_by        text,
  answered_at        timestamptz,
  channel            text NOT NULL DEFAULT 'whatsapp',
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS enquiries_org_idx ON enquiries(organization_id, status, created_at DESC);

-- Durable background jobs with retries. Claimed with SKIP LOCKED so several workers never run one twice.
CREATE TABLE IF NOT EXISTS jobs (
  id                 text PRIMARY KEY,
  organization_id    text,
  type               text NOT NULL,
  payload            jsonb NOT NULL DEFAULT '{}'::jsonb,
  status             text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'done', 'failed', 'dead')),
  attempts           integer NOT NULL DEFAULT 0,
  max_attempts       integer NOT NULL DEFAULT 4,
  run_after          timestamptz NOT NULL DEFAULT now(),
  last_error         text,
  idempotency_key    text UNIQUE,
  created_at         timestamptz NOT NULL DEFAULT now(),
  started_at         timestamptz,
  finished_at        timestamptz
);
CREATE INDEX IF NOT EXISTS jobs_queue_idx ON jobs(status, run_after);

CREATE TABLE IF NOT EXISTS password_resets (
  token_hash         text PRIMARY KEY,
  user_id            text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at         timestamptz NOT NULL,
  used_at            timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- ---------- v4: identity vs membership, first-login password change, per-agency WhatsApp, email platform, OTP ----------
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_prefs jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_logins integer NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until timestamptz;

-- Platform identity (users) vs agency relationship (memberships). One person can belong to several agencies.
CREATE TABLE IF NOT EXISTS memberships (
  id               text PRIMARY KEY,
  user_id          text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id  text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role             text NOT NULL CHECK (role IN ('agency_admin', 'agency', 'client')),
  client_id        text REFERENCES clients(id) ON DELETE SET NULL,
  status           text NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'suspended')),
  invited_by       text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id)
);
CREATE INDEX IF NOT EXISTS memberships_org_idx ON memberships(organization_id, role);
INSERT INTO memberships (id, user_id, organization_id, role, client_id)
  SELECT 'mem_' || substr(md5(u.id || u.organization_id), 1, 14), u.id, u.organization_id, u.role, (SELECT c.id FROM clients c WHERE c.user_id = u.id AND c.organization_id = u.organization_id LIMIT 1)
  FROM users u WHERE u.organization_id IS NOT NULL AND u.role IN ('agency_admin', 'agency', 'client')
  ON CONFLICT (user_id, organization_id) DO NOTHING;

-- One WhatsApp number (gateway session) per agency. The shared Super Agent number is the fallback.
CREATE TABLE IF NOT EXISTS whatsapp_channels (
  id               text PRIMARY KEY,
  organization_id  text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider         text NOT NULL DEFAULT 'openwa' CHECK (provider IN ('openwa', 'meta')),
  session_id       text UNIQUE,
  phone            text,
  label            text,
  status           text NOT NULL DEFAULT 'pending',
  last_error       text,
  webhook_id       text,
  created_by       text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS whatsapp_channels_org_idx ON whatsapp_channels(organization_id);
-- WAHA joined the provider list once the gateway gained one session per agency.
ALTER TABLE whatsapp_channels DROP CONSTRAINT IF EXISTS whatsapp_channels_provider_check;
ALTER TABLE whatsapp_channels ADD CONSTRAINT whatsapp_channels_provider_check CHECK (provider IN ('waha', 'openwa', 'meta'));
ALTER TABLE whatsapp_contacts ADD COLUMN IF NOT EXISTS channel_id text;
ALTER TABLE conversation_messages ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'whatsapp';

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS ai_settings jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS branding jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS reminder_days jsonb NOT NULL DEFAULT '[30,14,7,1]'::jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS website text;

-- Every important email: who, which template, whether it arrived.
CREATE TABLE IF NOT EXISTS email_log (
  id               text PRIMARY KEY,
  organization_id  text REFERENCES organizations(id) ON DELETE SET NULL,
  user_id          text REFERENCES users(id) ON DELETE SET NULL,
  client_id        text REFERENCES clients(id) ON DELETE SET NULL,
  template         text NOT NULL,
  to_email         text NOT NULL,
  subject          text NOT NULL,
  status           text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'dead', 'skipped')),
  provider_id      text,
  error            text,
  attempts         integer NOT NULL DEFAULT 0,
  related_type     text,
  related_id       text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  sent_at          timestamptz
);
CREATE INDEX IF NOT EXISTS email_log_org_idx ON email_log(organization_id, created_at DESC);

-- Template overrides: NULL organization = global default written by the super admin.
CREATE TABLE IF NOT EXISTS email_templates (
  id               text PRIMARY KEY,
  organization_id  text REFERENCES organizations(id) ON DELETE CASCADE,
  key              text NOT NULL,
  subject          text,
  heading          text,
  body             text,
  updated_by       text,
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS email_templates_key_idx ON email_templates(coalesce(organization_id, ''), key);

-- Email one-time codes, hashed, single use, short lived.
CREATE TABLE IF NOT EXISTS otps (
  id               text PRIMARY KEY,
  user_id          text REFERENCES users(id) ON DELETE CASCADE,
  email            text NOT NULL,
  purpose          text NOT NULL,
  code_hash        text NOT NULL,
  expires_at       timestamptz NOT NULL,
  attempts         integer NOT NULL DEFAULT 0,
  used_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS otps_email_idx ON otps(email, purpose, created_at DESC);

-- ============================================================
-- v5: quotes and invoices, campaigns, AI telemetry, onboarding
-- ============================================================

-- Per-agency defaults: currency, tax, terms, payment instructions, numbering.
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb;
-- Which onboarding steps this agency has completed.
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS onboarding jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Quotes and invoices share one table: kind decides the wording and the rules.
CREATE TABLE IF NOT EXISTS billing_documents (
  id                   text PRIMARY KEY,
  organization_id      text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id            text REFERENCES clients(id) ON DELETE SET NULL,
  kind                 text NOT NULL CHECK (kind IN ('quote', 'invoice')),
  number               text NOT NULL,
  status               text NOT NULL DEFAULT 'draft',
  customer_name        text NOT NULL,
  customer_email       text,
  customer_phone       text,
  customer_address     text,
  issue_date           date NOT NULL DEFAULT current_date,
  due_date             date,
  currency             text NOT NULL DEFAULT 'KES',
  subtotal             numeric(14,2) NOT NULL DEFAULT 0,
  discount_total       numeric(14,2) NOT NULL DEFAULT 0,
  tax_total            numeric(14,2) NOT NULL DEFAULT 0,
  total                numeric(14,2) NOT NULL DEFAULT 0,
  amount_paid          numeric(14,2) NOT NULL DEFAULT 0,
  notes                text,
  terms                text,
  payment_instructions text,
  reference            text,
  share_token          text,
  created_by           text REFERENCES users(id) ON DELETE SET NULL,
  sent_at              timestamptz,
  paid_at              timestamptz,
  decided_at           timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS billing_documents_number_idx ON billing_documents(organization_id, number);
CREATE INDEX IF NOT EXISTS billing_documents_org_idx ON billing_documents(organization_id, kind, created_at DESC);
CREATE INDEX IF NOT EXISTS billing_documents_client_idx ON billing_documents(client_id);
CREATE UNIQUE INDEX IF NOT EXISTS billing_documents_share_idx ON billing_documents(share_token) WHERE share_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS billing_lines (
  id               text PRIMARY KEY,
  document_id      text NOT NULL REFERENCES billing_documents(id) ON DELETE CASCADE,
  position         integer NOT NULL DEFAULT 0,
  description      text NOT NULL,
  detail           text,
  quantity         numeric(12,2) NOT NULL DEFAULT 1,
  unit_price       numeric(14,2) NOT NULL DEFAULT 0,
  discount_percent numeric(6,2) NOT NULL DEFAULT 0,
  tax_percent      numeric(6,2) NOT NULL DEFAULT 0,
  amount           numeric(14,2) NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS billing_lines_doc_idx ON billing_lines(document_id, position);

-- Document numbering per agency and kind, so numbers never collide or reuse.
CREATE TABLE IF NOT EXISTS number_sequences (
  organization_id  text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  kind             text NOT NULL,
  period           text NOT NULL,
  next_number      integer NOT NULL DEFAULT 1,
  PRIMARY KEY (organization_id, kind, period)
);

-- Promotional and transactional campaigns over WhatsApp and email.
CREATE TABLE IF NOT EXISTS campaigns (
  id               text PRIMARY KEY,
  organization_id  text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             text NOT NULL,
  channel          text NOT NULL CHECK (channel IN ('whatsapp', 'email', 'both')),
  status           text NOT NULL DEFAULT 'draft',
  audience         jsonb NOT NULL DEFAULT '{}'::jsonb,
  subject          text,
  body             text NOT NULL DEFAULT '',
  cta_label        text,
  cta_url          text,
  template_key     text,
  scheduled_at     timestamptz,
  started_at       timestamptz,
  finished_at      timestamptz,
  cancelled_at     timestamptz,
  created_by       text REFERENCES users(id) ON DELETE SET NULL,
  total_recipients integer NOT NULL DEFAULT 0,
  sent_count       integer NOT NULL DEFAULT 0,
  failed_count     integer NOT NULL DEFAULT 0,
  skipped_count    integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS campaigns_org_idx ON campaigns(organization_id, created_at DESC);

CREATE TABLE IF NOT EXISTS campaign_recipients (
  id               text PRIMARY KEY,
  campaign_id      text NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  organization_id  text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id        text REFERENCES clients(id) ON DELETE SET NULL,
  user_id          text REFERENCES users(id) ON DELETE SET NULL,
  name             text NOT NULL,
  email            text,
  phone            text,
  channel          text NOT NULL,
  status           text NOT NULL DEFAULT 'pending',
  error            text,
  sent_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS campaign_recipients_unique_idx ON campaign_recipients(campaign_id, channel, coalesce(email, ''), coalesce(phone, ''));
CREATE INDEX IF NOT EXISTS campaign_recipients_status_idx ON campaign_recipients(campaign_id, status);

-- People who asked not to be marketed to, per agency and channel.
CREATE TABLE IF NOT EXISTS suppressions (
  id               text PRIMARY KEY,
  organization_id  text REFERENCES organizations(id) ON DELETE CASCADE,
  channel          text NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  address          text NOT NULL,
  reason           text,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS suppressions_unique_idx ON suppressions(coalesce(organization_id, ''), channel, address);

-- Every model call: which agency, which model, how long, did it work.
CREATE TABLE IF NOT EXISTS ai_events (
  id               text PRIMARY KEY,
  organization_id  text REFERENCES organizations(id) ON DELETE SET NULL,
  user_id          text REFERENCES users(id) ON DELETE SET NULL,
  kind             text NOT NULL,
  channel          text,
  model            text,
  vendor           text,
  fallback_used    boolean NOT NULL DEFAULT false,
  ok               boolean NOT NULL DEFAULT true,
  escalated        boolean NOT NULL DEFAULT false,
  latency_ms       integer,
  tokens_in        integer,
  tokens_out       integer,
  error            text,
  at               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_events_at_idx ON ai_events(at DESC);
CREATE INDEX IF NOT EXISTS ai_events_org_idx ON ai_events(organization_id, at DESC);

-- Platform-wide AI policy and knowledge written by the super admin.
CREATE TABLE IF NOT EXISTS ai_policies (
  id               text PRIMARY KEY,
  scope            text NOT NULL DEFAULT 'global',
  organization_id  text REFERENCES organizations(id) ON DELETE CASCADE,
  ground_rules     text,
  knowledge        text,
  banned_phrases   text,
  updated_by       text,
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS ai_policies_scope_idx ON ai_policies(scope, coalesce(organization_id, ''));
`
