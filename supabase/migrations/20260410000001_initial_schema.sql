-- ============================================================
-- Assets Golden — Schema Inicial
-- Generado: 2026-04-10
-- ============================================================

-- ============================================================
-- TABLA: properties
-- 25 columnas — migradas desde CSV Lovable export
-- ============================================================
CREATE TABLE IF NOT EXISTS properties (
  id                UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at        TIMESTAMPTZ   DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   DEFAULT NOW(),

  -- Identificación
  title             TEXT          NOT NULL,
  slug              TEXT          UNIQUE,
  external_id       TEXT          UNIQUE,          -- id original del CSV

  -- Contenido
  description       TEXT,
  description_en    TEXT,

  -- Precio
  price             NUMERIC,
  currency          TEXT          DEFAULT 'EUR',

  -- Ubicación
  location          TEXT,                          -- ciudad libre (CSV: location)
  province          TEXT,                          -- CSV: province
  country           TEXT          DEFAULT 'ES',    -- CSV: country (ej: "Argentina")
  destination_id    UUID,                          -- FK futuro a destinations

  -- Características
  bedrooms          INTEGER,
  bathrooms         INTEGER,
  area_sqm          NUMERIC,

  -- Imágenes
  image_url         TEXT,
  gallery_urls      JSONB         DEFAULT '[]',

  -- Metadata
  features          JSONB         DEFAULT '[]',
  property_type     TEXT,                          -- apartment, villa, penthouse...
  classification    TEXT,                          -- investment, holiday, primary...
  status            TEXT          DEFAULT 'active',-- active, inactive, sold, available
  is_development    BOOLEAN       DEFAULT false,
  featured          BOOLEAN       DEFAULT false,

  -- URLs externas
  idealista_url     TEXT,
  nestseekers_url   TEXT,

  -- Admin
  created_by        UUID,

  CONSTRAINT properties_status_check CHECK (
    status IN ('active', 'inactive', 'sold', 'available', 'reserved')
  )
);

-- Índices útiles para filtros frecuentes
CREATE INDEX IF NOT EXISTS idx_properties_status    ON properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_country   ON properties (country);
CREATE INDEX IF NOT EXISTS idx_properties_type      ON properties (property_type);
CREATE INDEX IF NOT EXISTS idx_properties_featured  ON properties (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_properties_price     ON properties (price);

-- Trigger updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLA: leads
-- Conectada con n8n — formularios captación
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at            TIMESTAMPTZ DEFAULT NOW(),

  -- Datos de contacto
  name                  TEXT        NOT NULL,
  email                 TEXT,
  phone                 TEXT,

  -- Contexto inmobiliario
  neighborhood          TEXT,
  property_value_range  TEXT,
  sale_timeline         TEXT,
  is_owner              BOOLEAN,
  interest              TEXT,        -- buy, sell, invest, rent
  message               TEXT,
  location              TEXT,

  -- Scoring
  score                 INTEGER,
  score_summary         TEXT,

  -- Gestión
  status                TEXT        DEFAULT 'new',   -- new, contacted, qualified, lost
  source                TEXT        DEFAULT 'website', -- meta_ads, website, form_type...
  assigned_to           UUID,
  notes                 TEXT,

  CONSTRAINT leads_status_check CHECK (
    status IN ('new', 'contacted', 'qualified', 'lost', 'converted')
  )
);

CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_source     ON leads (source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);

-- ============================================================
-- TABLA: blog_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  title         TEXT        NOT NULL,
  title_en      TEXT,
  slug          TEXT        UNIQUE,
  content       TEXT,
  content_en    TEXT,
  excerpt       TEXT,
  excerpt_en    TEXT,
  cover_image   TEXT,
  category      TEXT,
  published     BOOLEAN     DEFAULT false,
  published_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts (published, published_at DESC);

CREATE OR REPLACE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLA: team_members
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),

  name          TEXT        NOT NULL,
  role_es       TEXT,
  role_en       TEXT,
  bio_es        TEXT,
  bio_en        TEXT,
  specialties   JSONB       DEFAULT '[]',
  photo_url     TEXT,
  linkedin_url  TEXT,
  country       TEXT,
  member_type   TEXT        DEFAULT 'team',  -- founder, partner, team
  order_index   INTEGER     DEFAULT 0,
  active        BOOLEAN     DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_team_active ON team_members (active, order_index);

-- ============================================================
-- TABLA: country_destinations
-- Páginas de destinos por país (generado con AI en proyecto Vite)
-- ============================================================
CREATE TABLE IF NOT EXISTS country_destinations (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  country_name    TEXT    UNIQUE NOT NULL,
  slug            TEXT    UNIQUE,
  tagline         TEXT,
  tagline_en      TEXT,
  description     TEXT,
  description_en  TEXT,
  hero_image_url  TEXT,
  card_image_url  TEXT,
  highlights      JSONB   DEFAULT '[]',
  highlights_en   JSONB   DEFAULT '[]',
  market_info     JSONB,
  market_info_en  JSONB,
  lifestyle       JSONB,
  lifestyle_en    JSONB,
  sort_order      INTEGER DEFAULT 0,
  active          BOOLEAN DEFAULT true
);

-- ============================================================
-- ACTIVAR ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE properties          ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads                ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_destinations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS RLS — LECTURA PÚBLICA
-- ============================================================

-- Propiedades activas son públicas
CREATE POLICY "properties_public_read" ON properties
  FOR SELECT USING (status IN ('active', 'available'));

-- Blog posts publicados son públicos
CREATE POLICY "blog_posts_public_read" ON blog_posts
  FOR SELECT USING (published = true);

-- Equipo activo es público
CREATE POLICY "team_members_public_read" ON team_members
  FOR SELECT USING (active = true);

-- Destinos activos son públicos
CREATE POLICY "destinations_public_read" ON country_destinations
  FOR SELECT USING (active = true);

-- Leads: solo inserción pública (formularios web y Meta Ads vía n8n)
CREATE POLICY "leads_public_insert" ON leads
  FOR INSERT WITH CHECK (true);
