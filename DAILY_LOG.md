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
- [ ] Páginas legales GDPR: política de privacidad, términos, banner cookies (BORRADORES creados con [PLACEHOLDER]; pendiente validación legal y banner)
- [ ] Atilio o asesor legal: validar texto de las 3 páginas legales (`/politica-de-privacidad`, `/aviso-legal`, `/politica-de-cookies`) y reemplazar todos los `[PLACEHOLDER: …]` por valores reales (razón social, CIF, domicilio, registro mercantil, teléfono, emails, jurisdicción)
- [ ] Atilio: aceptar/firmar los DPAs en los dashboards de Supabase, Vercel, Cloudflare, Google, Resend y Upstash. Algunos requieren accept-click, otros solicitar al soporte. Sin DPA aceptado, la frase de la política de privacidad §5 es inexacta.
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

### Sesión 2026-05-06 — sesión 3 (páginas legales GDPR — borradores)

**Contexto:** Iván pidió crear las páginas legales GDPR-compliant
requeridas antes del go-live: política de privacidad, aviso legal y
política de cookies. Banner de cookies + checkbox GDPR queda fuera
de esta sesión (depende de captcha + refactor de leads).

**Trabajo hecho:**
- Detectado en PASO 1 que `/politica-de-privacidad` ya existía
  (legacy de Lovable, 10 secciones razonables pero con datos
  hardcoded y secciones faltantes); decidida con el usuario la
  Opción B (ampliar manteniendo estructura)
- Reescrita `/politica-de-privacidad` con secciones añadidas:
  identidad completa (CIF, registro mercantil), transferencias
  internacionales (EU-US DPF + SCCs), lista completa de proveedores
  (Supabase, Vercel, Cloudflare, Resend, Google, Upstash), referencias
  a artículos del RGPD (15-22), citas a LOPDGDD y LSSI-CE
- Convertidos a `[PLACEHOLDER: …]` todos los datos hardcoded
  (razón social, CIF, domicilio, registro mercantil, teléfono,
  emails, jurisdicción) con sufijo del valor sospechado y nota
  para confirmación con Atilio
- Creada `/aviso-legal` desde cero con 10 secciones LSSI-CE Art. 10:
  identificación del prestador, objeto y aceptación, condiciones
  de uso, propiedad intelectual, información sobre los inmuebles
  (no constituye oferta contractual), limitación de responsabilidad,
  comunicaciones electrónicas, protección de datos, modificaciones,
  legislación aplicable y jurisdicción
- Creada `/politica-de-cookies` desde cero con 8 secciones según
  guía AEPD: definición, tipos (técnicas estrictamente necesarias
  con tabla detallada de cookies Supabase/Cloudflare/Vercel,
  analíticas previstas con GA4, publicitarias previstas con Meta
  Pixel/Google Ads), base jurídica, gestión y revocación con
  enlaces a navegadores, transferencias internacionales,
  retención (24 meses AEPD), modificaciones
- Footer (`src/components/Footer.tsx`): agregados enlaces a
  `/aviso-legal` y `/politica-de-cookies` junto al ya existente de
  privacidad en el bottom-bar; ajustado layout para que envuelva en
  móvil
- Sitemap (`src/app/sitemap.ts`): añadidas las 3 rutas con
  `priority: 0.3` y `changeFrequency: 'yearly'`
- Build limpio: `Compiled successfully` + `Finished TypeScript`,
  las 3 rutas legales aparecen como `○ (Static)`

**Archivos tocados:**
- MODIFIED: `src/app/(public)/politica-de-privacidad/page.tsx`
  (reescrita, v1.0 → v2.0)
- CREATED: `src/app/(public)/aviso-legal/page.tsx`
- CREATED: `src/app/(public)/politica-de-cookies/page.tsx`
- MODIFIED: `src/components/Footer.tsx`
- MODIFIED: `src/app/sitemap.ts`
- MODIFIED: `DAILY_LOG.md` (esta entrada + nuevo pendiente Atilio)

**Commits:** ninguno todavía — pendiente de validación visual del
usuario.

**Próximo paso sugerido:**
1. Iván abre las 3 páginas en el dev server y revisa visualmente
   (espaciado, jerarquía, tabla de cookies en mobile).
2. Una vez validado: commit + push.
3. Después atacar uno de los siguientes pendientes activos:
   - **Banner de cookies + GDPR checkbox** en formularios
     (pareja natural: aprovechar para integrar Cloudflare Turnstile
     en los 3 endpoints + 1 server action que ya están como
     bloqueante go-live)
   - O esperar acceso Resend de Atilio para refactor pipeline leads
4. Cuando Atilio tenga lista la documentación legal real (CIF,
   registro mercantil, dirección completa, emails de privacidad),
   reemplazar los `[PLACEHOLDER: …]` en las 3 páginas + bottom-bar
   del footer si la razón social difiere de "CFG Global Investment S.L.".

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

*Última edición automática por Claude Code: 2026-05-06 (sesión 3)*
