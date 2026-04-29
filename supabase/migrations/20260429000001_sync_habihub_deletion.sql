-- ============================================================
-- Sync HabiHub — borrado selectivo + tracking
-- Generado: 2026-04-29
-- Idempotente: seguro de re-ejecutar
-- ============================================================

-- Documentar columnas que ya están en cloud sin migración previa
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS external_source text,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;

-- Crear sync_logs si no existe (refleja la estructura cloud)
CREATE TABLE IF NOT EXISTS sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz,
  feed_source text NOT NULL,
  total_in_feed integer DEFAULT 0,
  matched_by_external_id integer DEFAULT 0,
  matched_by_fingerprint integer DEFAULT 0,
  inserted_new integer DEFAULT 0,
  conflicts integer DEFAULT 0,
  errors integer DEFAULT 0,
  dry_run boolean DEFAULT false,
  details jsonb,
  triggered_by uuid
);

-- Lo nuevo: tracking de borrados y updates
ALTER TABLE sync_logs
  ADD COLUMN IF NOT EXISTS deleted_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_count integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at
  ON sync_logs(started_at DESC);
