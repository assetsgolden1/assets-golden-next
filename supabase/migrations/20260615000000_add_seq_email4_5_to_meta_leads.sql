-- Agrega los timestamps de los correos 4 y 5 de la secuencia de nurture.
-- La tabla meta_leads ya tenía seq_email1/2/3_sent_at (migración 20260613000000).
-- Idempotente: ADD COLUMN IF NOT EXISTS.

ALTER TABLE public.meta_leads
  ADD COLUMN IF NOT EXISTS seq_email4_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS seq_email5_sent_at TIMESTAMPTZ;
