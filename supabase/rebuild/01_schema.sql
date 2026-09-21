-- ============================================================
-- Assets Golden — RECONSTRUCCIÓN del esquema tras el borrado
-- del proyecto mromkwpqrxpxbbxhdofs (22/09/2026).
--
-- Fuente: 7 migraciones del repo + esquema completo extraído del
-- proyecto vivo el 05/09/2026 (list_tables verbose) + lista de
-- funciones/triggers/policies del mismo día + uso en el código.
-- Idempotente: seguro de re-ejecutar.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto  WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm   WITH SCHEMA public;

-- ------------------------------------------------------------
-- Funciones de trigger
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$;

-- country: TRIM (casing preservado); province/location: TRIM + INITCAP; vacío → NULL
CREATE OR REPLACE FUNCTION public.normalize_property_fields()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.country IS NOT NULL THEN
    NEW.country := NULLIF(TRIM(NEW.country), '');
  END IF;
  IF NEW.province IS NOT NULL THEN
    NEW.province := NULLIF(INITCAP(LOWER(TRIM(NEW.province))), '');
  END IF;
  IF NEW.location IS NOT NULL THEN
    NEW.location := NULLIF(INITCAP(LOWER(TRIM(NEW.location))), '');
  END IF;
  RETURN NEW;
END $$;

-- ref_code secuencial AG-00001… (los existentes se cargan con su valor)
CREATE SEQUENCE IF NOT EXISTS public.properties_ref_code_seq;

CREATE OR REPLACE FUNCTION public.generate_ref_code()
RETURNS TEXT LANGUAGE plpgsql SET search_path = public AS $$
DECLARE n BIGINT;
BEGIN
  n := nextval('public.properties_ref_code_seq');
  RETURN 'AG-' || LPAD(n::TEXT, 5, '0');
END $$;

CREATE OR REPLACE FUNCTION public.assign_ref_code()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ref_code IS NULL OR NEW.ref_code = '' THEN
    NEW.ref_code := public.generate_ref_code();
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.update_lead_status_changed_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_changed_at := NOW();
  END IF;
  RETURN NEW;
END $$;

-- ------------------------------------------------------------
-- properties
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.properties (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  title            TEXT        NOT NULL,
  slug             TEXT        UNIQUE,
  external_id      TEXT        UNIQUE,
  description      TEXT,
  description_en   TEXT,
  price            NUMERIC,
  currency         TEXT        DEFAULT 'EUR',
  location         TEXT,
  province         TEXT,
  country          TEXT        DEFAULT 'ES',
  destination_id   UUID,
  bedrooms         INTEGER,
  bathrooms        INTEGER,
  area_sqm         NUMERIC,
  image_url        TEXT,
  gallery_urls     JSONB       DEFAULT '[]'::jsonb,
  features         JSONB       DEFAULT '[]'::jsonb,
  property_type    TEXT,
  classification   TEXT,
  status           TEXT        DEFAULT 'active',
  is_development   BOOLEAN     DEFAULT false,
  featured         BOOLEAN     DEFAULT false,
  idealista_url    TEXT,
  nestseekers_url  TEXT,
  created_by       UUID,
  external_source  TEXT        DEFAULT 'manual',
  last_synced_at   TIMESTAMPTZ,
  featured_order   INTEGER     DEFAULT 0,
  hidden           BOOLEAN     DEFAULT false,
  sold             BOOLEAN     DEFAULT false,
  ref_code         TEXT        UNIQUE,
  habihub_dev_id   TEXT,
  habihub_unit     TEXT,
  hidden_by_sync   BOOLEAN     NOT NULL DEFAULT false,
  legacy_slug      TEXT,
  CONSTRAINT properties_status_check CHECK (status IN ('active','inactive','sold','available','reserved'))
);
COMMENT ON COLUMN public.properties.habihub_dev_id IS 'Development ID extraído del <ref> del feed HabiHub (parte antes del guion). Usar para filtrar en HabiHub.';
COMMENT ON COLUMN public.properties.habihub_unit   IS 'Número de unidad dentro del development (parte después del guion en <ref>).';
COMMENT ON COLUMN public.properties.hidden_by_sync IS 'true = retirada por el sync de HabiHub al desaparecer del feed. Reversible: vuelve a false si reaparece en el feed. No pisa los campos hidden/sold (manuales de Atilio).';

CREATE INDEX IF NOT EXISTS idx_properties_status         ON public.properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_country        ON public.properties (country);
CREATE INDEX IF NOT EXISTS idx_properties_type           ON public.properties (property_type);
CREATE INDEX IF NOT EXISTS idx_properties_featured       ON public.properties (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_properties_price          ON public.properties (price);
CREATE INDEX IF NOT EXISTS idx_properties_classification ON public.properties (classification);
CREATE INDEX IF NOT EXISTS idx_properties_external_source ON public.properties (external_source);
CREATE INDEX IF NOT EXISTS idx_properties_legacy_slug    ON public.properties (legacy_slug) WHERE legacy_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_visible        ON public.properties (status, hidden, hidden_by_sync);
CREATE INDEX IF NOT EXISTS idx_properties_location_trgm  ON public.properties USING gin (location gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_properties_title_trgm     ON public.properties USING gin (title gin_trgm_ops);

DROP TRIGGER IF EXISTS properties_updated_at ON public.properties;
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS normalize_property_fields_trigger ON public.properties;
CREATE TRIGGER normalize_property_fields_trigger BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.normalize_property_fields();
DROP TRIGGER IF EXISTS trg_assign_ref_code ON public.properties;
CREATE TRIGGER trg_assign_ref_code BEFORE INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.assign_ref_code();

-- ------------------------------------------------------------
-- leads
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  name                  TEXT        NOT NULL,
  email                 TEXT,
  phone                 TEXT,
  neighborhood          TEXT,
  property_value_range  TEXT,
  sale_timeline         TEXT,
  is_owner              BOOLEAN,
  interest              TEXT,
  message               TEXT,
  location              TEXT,
  score                 INTEGER,
  score_summary         TEXT,
  status                TEXT        DEFAULT 'new',
  source                TEXT        DEFAULT 'website',
  assigned_to           UUID,
  notes                 TEXT,
  property_id           TEXT,
  property_title        TEXT,
  property_url          TEXT,
  status_changed_at     TIMESTAMPTZ DEFAULT NOW(),
  utm_source            TEXT,
  utm_medium            TEXT,
  utm_campaign          TEXT,
  utm_content           TEXT,
  fbclid                TEXT,
  landing_page          TEXT,
  referrer              TEXT,
  CONSTRAINT leads_status_check CHECK (status IN ('new','contacted','in_progress','closed','discarded'))
);
CREATE INDEX IF NOT EXISTS idx_leads_status     ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_source     ON public.leads (source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
DROP TRIGGER IF EXISTS leads_status_changed_at_trigger ON public.leads;
CREATE TRIGGER leads_status_changed_at_trigger BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_lead_status_changed_at();

-- ------------------------------------------------------------
-- blog_posts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  title            TEXT        NOT NULL,
  title_en         TEXT,
  slug             TEXT        UNIQUE,
  content          TEXT,
  content_en       TEXT,
  excerpt          TEXT,
  excerpt_en       TEXT,
  cover_image      TEXT,
  category         TEXT,
  published        BOOLEAN     DEFAULT false,
  published_at     TIMESTAMPTZ,
  banner_image_url TEXT,
  read_time        INTEGER,
  language         TEXT        DEFAULT 'es',
  meta_description TEXT,
  citations        JSONB,
  meta_title       TEXT
);
COMMENT ON COLUMN public.blog_posts.citations  IS 'Array JSON-LD de referencias (schema.org CreativeWork / GovernmentService) para el bloque citation del BlogPosting schema';
COMMENT ON COLUMN public.blog_posts.meta_title IS 'Title para SERP (<=45 chars; el sitio añade " — Assets Golden"). Si es NULL se usa title.';
CREATE INDEX IF NOT EXISTS idx_blog_published ON public.blog_posts (published, published_at DESC);
DROP TRIGGER IF EXISTS blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ------------------------------------------------------------
-- team_members
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  name          TEXT        NOT NULL,
  role_es       TEXT,
  role_en       TEXT,
  bio_es        TEXT,
  bio_en        TEXT,
  specialties   JSONB       DEFAULT '[]'::jsonb,
  photo_url     TEXT,
  linkedin_url  TEXT,
  country       TEXT,
  member_type   TEXT        DEFAULT 'team',
  order_index   INTEGER     DEFAULT 0,
  active        BOOLEAN     DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_team_active ON public.team_members (active, order_index);

-- ------------------------------------------------------------
-- country_destinations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.country_destinations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  country_name    TEXT        UNIQUE NOT NULL,
  slug            TEXT        UNIQUE,
  tagline         TEXT,
  tagline_en      TEXT,
  description     TEXT,
  description_en  TEXT,
  hero_image_url  TEXT,
  card_image_url  TEXT,
  highlights      JSONB       DEFAULT '[]'::jsonb,
  highlights_en   JSONB       DEFAULT '[]'::jsonb,
  market_info     JSONB,
  market_info_en  JSONB,
  lifestyle       JSONB,
  lifestyle_en    JSONB,
  sort_order      INTEGER     DEFAULT 0,
  active          BOOLEAN     DEFAULT true,
  city_images     JSONB       DEFAULT '{}'::jsonb
);

-- ------------------------------------------------------------
-- user_roles / agents (dependen de auth.users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL DEFAULT 'admin',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agents (
  id                   UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name            TEXT        NOT NULL,
  email                TEXT        NOT NULL,
  phone                TEXT,
  agency_name          TEXT,
  logo_url             TEXT,
  active               BOOLEAN     DEFAULT true,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  white_label_enabled  BOOLEAN     NOT NULL DEFAULT false
);
COMMENT ON COLUMN public.agents.white_label_enabled IS 'Si es true, el PDF usa el logo y la agencia del asesor. Por defecto false: marca Assets Golden.';

-- ------------------------------------------------------------
-- sync_logs / admin_audit_log
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at              TIMESTAMPTZ DEFAULT NOW(),
  finished_at             TIMESTAMPTZ,
  feed_source             TEXT        NOT NULL,
  total_in_feed           INTEGER     DEFAULT 0,
  matched_by_external_id  INTEGER     DEFAULT 0,
  matched_by_fingerprint  INTEGER     DEFAULT 0,
  inserted_new            INTEGER     DEFAULT 0,
  conflicts               INTEGER     DEFAULT 0,
  errors                  INTEGER     DEFAULT 0,
  dry_run                 BOOLEAN     DEFAULT false,
  details                 JSONB,
  triggered_by            UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_count           INTEGER     DEFAULT 0,
  updated_count           INTEGER     DEFAULT 0,
  matched_by_slug         INTEGER     NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON public.sync_logs (started_at DESC);

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_user_id  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email    TEXT,
  action         TEXT        NOT NULL,
  entity_type    TEXT        NOT NULL,
  entity_id      TEXT,
  entity_label   TEXT,
  metadata       JSONB,
  ip_address     TEXT,
  user_agent     TEXT
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor      ON public.admin_audit_log (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_entity     ON public.admin_audit_log (entity_type, entity_id);

-- ------------------------------------------------------------
-- Meta leads
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meta_leads_synced (
  meta_lead_id  TEXT        PRIMARY KEY,
  form_id       TEXT        NOT NULL,
  synced_at     TIMESTAMPTZ DEFAULT NOW(),
  email         TEXT,
  created_time  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.meta_sync_runs (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id           TEXT        NOT NULL,
  started_at        TIMESTAMPTZ DEFAULT NOW(),
  finished_at       TIMESTAMPTZ,
  leads_fetched     INTEGER     DEFAULT 0,
  leads_duplicated  INTEGER     DEFAULT 0,
  leads_added       INTEGER     DEFAULT 0,
  status            TEXT        DEFAULT 'running',
  error_message     TEXT,
  details           JSONB
);

CREATE TABLE IF NOT EXISTS public.meta_leads (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_lead_id        TEXT        UNIQUE NOT NULL,
  email               TEXT,
  nombre              TEXT,
  telefono            TEXT,
  tipo_propiedad      TEXT,
  presupuesto_raw     TEXT,
  presupuesto         TEXT,
  timeline            TEXT,
  purpose             TEXT,
  variante            TEXT,
  created_time        TIMESTAMPTZ,
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  seq_email1_sent_at  TIMESTAMPTZ,
  seq_email2_sent_at  TIMESTAMPTZ,
  seq_email3_sent_at  TIMESTAMPTZ,
  seq_paused          BOOLEAN     NOT NULL DEFAULT false,
  seq_email4_sent_at  TIMESTAMPTZ,
  seq_email5_sent_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_meta_leads_created_time ON public.meta_leads (created_time DESC);
CREATE INDEX IF NOT EXISTS idx_meta_leads_email        ON public.meta_leads (email);

-- ------------------------------------------------------------
-- RPC usada por /admin/propiedades
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_property_filters()
RETURNS JSON LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT json_build_object(
    'countries', (SELECT COALESCE(json_agg(DISTINCT country), '[]'::json) FROM public.properties WHERE country IS NOT NULL AND country <> ''),
    'types',     (SELECT COALESCE(json_agg(DISTINCT property_type), '[]'::json) FROM public.properties WHERE property_type IS NOT NULL AND property_type <> '')
  );
$$;

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
ALTER TABLE public.properties           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_leads_synced    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_sync_runs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_leads           ENABLE ROW LEVEL SECURITY;

-- Lectura pública (web con publishable key)
DROP POLICY IF EXISTS properties_public_read   ON public.properties;
CREATE POLICY properties_public_read   ON public.properties FOR SELECT USING (status IN ('active','available'));
DROP POLICY IF EXISTS blog_posts_public_read   ON public.blog_posts;
CREATE POLICY blog_posts_public_read   ON public.blog_posts FOR SELECT USING (published = true);
DROP POLICY IF EXISTS team_members_public_read ON public.team_members;
CREATE POLICY team_members_public_read ON public.team_members FOR SELECT USING (active = true);
DROP POLICY IF EXISTS destinations_public_read ON public.country_destinations;
CREATE POLICY destinations_public_read ON public.country_destinations FOR SELECT USING (active = true);
DROP POLICY IF EXISTS leads_public_insert      ON public.leads;
CREATE POLICY leads_public_insert      ON public.leads FOR INSERT WITH CHECK (true);

-- Roles: cada usuario logueado lee su propia fila (getUserRole con cookies del usuario)
DROP POLICY IF EXISTS user_roles_self_read ON public.user_roles;
CREATE POLICY user_roles_self_read ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Agentes: leen/actualizan su propio perfil (portal); admins leen todos
DROP POLICY IF EXISTS agents_self_read ON public.agents;
CREATE POLICY agents_self_read ON public.agents FOR SELECT TO authenticated
  USING (id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS agents_self_update ON public.agents;
CREATE POLICY agents_self_update ON public.agents FOR UPDATE TO authenticated USING (id = auth.uid());

-- Agentes autenticados ven TODO el catálogo (portal) — incluye ocultas/vendidas
DROP POLICY IF EXISTS properties_authenticated_read ON public.properties;
CREATE POLICY properties_authenticated_read ON public.properties FOR SELECT TO authenticated USING (true);

-- Audit log
DROP POLICY IF EXISTS admins_select_audit ON public.admin_audit_log;
CREATE POLICY admins_select_audit ON public.admin_audit_log FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS admins_insert_audit ON public.admin_audit_log;
CREATE POLICY admins_insert_audit ON public.admin_audit_log FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Admins autenticados leen leads y sync_logs desde el panel
DROP POLICY IF EXISTS leads_admin_read ON public.leads;
CREATE POLICY leads_admin_read ON public.leads FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS sync_logs_admin_read ON public.sync_logs;
CREATE POLICY sync_logs_admin_read ON public.sync_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- meta_* : sin policies (solo service role).
