# Daily Log — Assets Golden Next

> Bitácora operativa del proyecto. Claude Code lee este archivo al
> iniciar sesión y lo actualiza al cerrar. NO modificar manualmente
> la sección "Historial de sesiones" — solo agregar entradas nuevas
> arriba.

---

## 🔴 Pendientes activos (orden de prioridad)

Lista viva. Claude Code la actualiza al final de cada sesión:
marca con `[x]` lo terminado, agrega nuevos pendientes detectados,
reordena si la prioridad cambió.

### Bloqueantes para go-live
- [ ] Captcha Cloudflare Turnstile en formularios públicos (3 endpoints + 1 server action)
- [ ] Refactor pipeline de leads: eliminar n8n, consolidar en `processLead`, agregar Resend a todos los endpoints (depende de acceso Resend de Atilio)
- [ ] Rotación de claves SUPABASE_SERVICE_ROLE_KEY y GOOGLE_SHEETS_CREDENTIALS_JSON
- [ ] Páginas legales GDPR: política de privacidad, términos, banner cookies
- [ ] Aviso GDPR en formularios `/contacto` y `/mi-demanda`
- [ ] DNS de Atilio para conectar dominio assetsgolden.com

### Importantes (post go-live)
- [ ] Audit log de cambios admin
- [ ] Migración de 166 imágenes legacy de Lovable a Supabase actual
- [ ] Test PDF en producción end-to-end con agente real
- [ ] Auditoría proyecto Supabase huérfano `yagrwbmsufpvjcgxkuoz`
- [ ] Definir criterios `/inversiones` con Atilio
- [ ] Monitoreo del cron y alertas

### Limpieza técnica
- [ ] Borrar backup `properties_backup_20260429` (después de 1-2 crons sin issues)
- [ ] Limpiar variable zombie `conflictIds` del sync
- [x] Borrar carpeta vacía `src/app/admin/destinos/`
- [x] Borrar carpeta vacía `src/app/api/admin/update-destino/`
- [x] CSP: remover `api.anthropic.com`
- [x] Verificar bucket `team-photos` en Supabase (existe, público)

### Pendientes operativos (Atilio)
- [ ] Acceso a cuenta Resend (dominio assetsgolden.com ya está verificado en su cuenta)
- [ ] Email del socio para crear cuenta admin
- [ ] Acceso al panel DNS del dominio
- [ ] Validar criterios `/inversiones`
- [ ] Firma de contrato comercial formal
- [ ] Decisión sobre infraestructura (cuentas IBott vs Assets Golden)
- [ ] Acceso Meta Business Manager, Google Ads, GA4, Search Console (Fase 2)

---

## 📝 Historial de sesiones

Append-only. Cada entrada nueva va ARRIBA (más reciente primero).
Formato: fecha, contexto, decisiones tomadas, archivos tocados,
commits, próximo paso sugerido.

---

### Sesión 2026-05-06 — sesión 2 (auditoría de claves + plan de rotación)

**Contexto:** Iván pidió un diagnóstico completo del estado de
secretos del proyecto antes de ejecutar la rotación pendiente. Solo
lectura — sin modificaciones, sin rotación.

**Trabajo hecho:**
- Verificado historial git completo (`--all --full-history`) para
  `.env`, `.env.local`, `.env.development`, `.env.production` y
  variantes `.bak/.old/.backup`: ninguno commiteado nunca
- Auditado `.gitignore`: cubre `.env*` y `*.pem`; falta `*.key`
  (recomendación menor, no bloqueante)
- Búsqueda exhaustiva de secretos hardcoded en src/scripts/supabase
  (patrones JWT Supabase, Stripe, OAuth, AWS, PRIVATE KEY,
  literales API_KEY/SECRET/TOKEN): **0 matches críticos**, todo
  pasa por `process.env.X`
- Mapeados los 16 archivos que consumen `SUPABASE_SERVICE_ROLE_KEY`
  (6 runtime + 10 scripts CLI) y los 2 que consumen
  `GOOGLE_SHEETS_CREDENTIALS_JSON`
- Inventariadas 16 env vars del proyecto, clasificadas en
  pública/sensible/config
- Plan de rotación documentado para ambas claves con orden, smoke
  tests, rollback y blockers identificados
- Hallazgos menores anotados: `test-sheets/route.ts` logea
  Sheet ID completo en Vercel logs; `debug-env/route.ts` existió
  en historia (sin leak real, ya removido); SA Google compartida
  con proyecto agencia (relevante para Opción A vs B)

**Severidad global del audit:** 🟢 BAJA — no hay exposición real, la
rotación es preventiva.

**Archivos tocados:**
- CREATED: `outputs/security-audit-2026-05-06.md`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente de OK del usuario.

**Próximo paso sugerido:**
1. Iván revisa `outputs/security-audit-2026-05-06.md`.
2. Confirmar antes de rotar:
   - Titularidad/acceso al Supabase Dashboard `mromkwpqrxpxbbxhdofs`
   - Titularidad/acceso a GCP Console `agencia-automatizacion-490823`
   - Si la SA `assets-golden-sheets@…` se comparte con n8n/agencia
     (decide Opción A vs B para rotar Sheets)
3. Coordinar ventana de mantenimiento (~15 min) en horario bajo-tráfico
4. Ejecutar rotación: primero `SUPABASE_SERVICE_ROLE_KEY`, después
   `GOOGLE_SHEETS_CREDENTIALS_JSON`. Opcionalmente aprovechar para
   rotar también `CRON_SECRET`, `RESEND_API_KEY`,
   `UPSTASH_REDIS_REST_TOKEN`.

---

### Sesión 2026-05-06 (cleanup técnico + sistema DAILY_LOG)

**Contexto:** sesión de limpieza menor + introducción del sistema DAILY_LOG.

**Trabajo hecho:**
- Borradas carpetas vacías `src/app/admin/destinos/` y `src/app/api/admin/update-destino/`
- Eliminada variable zombie `conflictIds` del sync HabiHub (era Set sin .add())
- Removido `api.anthropic.com` del CSP de next.config.ts (no se usaba)
- Verificado bucket `team-photos` en Supabase (existe y está OK)
- Creado este DAILY_LOG.md con el sistema de bitácora

**Archivos tocados:**
- DELETED: `src/app/admin/destinos/`, `src/app/api/admin/update-destino/`
- MODIFIED: `src/app/api/admin/sync-habihub/route.ts`, `next.config.ts`, `CLAUDE.md`
- CREATED: `DAILY_LOG.md`

**Commits:**
- `e73892a` — chore(cleanup): borrar carpetas vacías + variable zombie + CSP unused
- `4cd32b4` — feat(devx): sistema DAILY_LOG.md para bitácora entre sesiones

**Próximo paso sugerido:** Esperar acceso a Resend de Atilio para hacer
el refactor del pipeline de leads. Mientras tanto, atacar item de
pendientes activos (auditoría de claves o páginas legales GDPR).

---

*Última edición automática por Claude Code: 2026-05-06 (sesión 2)*
