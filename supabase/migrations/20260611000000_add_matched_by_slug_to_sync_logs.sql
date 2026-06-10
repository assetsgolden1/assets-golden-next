-- FASE-5-P9: nuevo nivel de match por slug en el sync HabiHub.
-- El endpoint persiste stats.matched_by_slug en sync_logs vía `...stats`.
-- Sin esta columna, el UPDATE de sync_logs fallaba entero (details/diagnostics
-- quedaban sin guardar). Idempotente.
ALTER TABLE sync_logs ADD COLUMN IF NOT EXISTS matched_by_slug integer NOT NULL DEFAULT 0;
