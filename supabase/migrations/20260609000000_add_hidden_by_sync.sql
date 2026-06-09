-- Columna para ocultar reversiblemente propiedades que desaparecen del feed HabiHub.
-- El sync la pone a TRUE cuando una propiedad no aparece en el feed; la revierte a FALSE
-- cuando la propiedad reaparece. Las queries públicas deben excluir hidden_by_sync=TRUE.
-- Ya aplicada en producción — idempotente con IF NOT EXISTS.
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS hidden_by_sync boolean NOT NULL DEFAULT false;
