-- Audit log de acciones administrativas críticas.
-- Append-only por diseño: sin UPDATE, sin DELETE vía RLS.
-- Los inserts van siempre por service_role (bypasea RLS);
-- la policy de INSERT es salvaguarda defensiva para el cliente anon.

CREATE TABLE public.admin_audit_log (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_user_id UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email   TEXT,
  action        TEXT        NOT NULL,
  entity_type   TEXT        NOT NULL,
  entity_id     TEXT,
  entity_label  TEXT,
  metadata      JSONB,
  ip_address    TEXT,
  user_agent    TEXT
);

CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log (created_at DESC);
CREATE INDEX idx_admin_audit_log_actor      ON public.admin_audit_log (actor_user_id);
CREATE INDEX idx_admin_audit_log_entity     ON public.admin_audit_log (entity_type, entity_id);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_select_audit" ON public.admin_audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admins_insert_audit" ON public.admin_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
