-- Tabla meta_leads: persiste cada lead de Meta con sus campos parseados.
-- Base de la secuencia de nurture ramificada por presupuesto.
-- ADICIONAL al Sheet + meta_leads_synced (no los reemplaza).
-- Solo se accede vía service_role desde el backend del sync.
-- RLS habilitado SIN policy pública (igual que meta_leads_synced):
-- service_role bypasea RLS; sin policies, anon/authenticated no leen ni escriben.

CREATE TABLE public.meta_leads (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_lead_id        TEXT        UNIQUE NOT NULL,
  email               TEXT,
  nombre              TEXT,
  telefono            TEXT,
  tipo_propiedad      TEXT,
  presupuesto_raw     TEXT,        -- valor crudo de Meta, ej '1m_2m_eur' (antes del BUDGET_MAP)
  presupuesto         TEXT,        -- etiqueta legible, ej '1M - 2M EUR'
  timeline            TEXT,
  purpose             TEXT,
  variante            TEXT,
  created_time        TIMESTAMPTZ,
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  seq_email1_sent_at  TIMESTAMPTZ,
  seq_email2_sent_at  TIMESTAMPTZ,
  seq_email3_sent_at  TIMESTAMPTZ,
  seq_paused          BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_meta_leads_created_time ON public.meta_leads (created_time DESC);
CREATE INDEX idx_meta_leads_email        ON public.meta_leads (email);

ALTER TABLE public.meta_leads ENABLE ROW LEVEL SECURITY;
