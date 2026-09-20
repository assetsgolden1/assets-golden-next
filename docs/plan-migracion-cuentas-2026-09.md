# Plan de migración de cuentas — entrega a Atilio y Joan

> Estado: decisiones cerradas el 05/09/2026 (sección 3). **Fase 0 ejecutada el 05/09** (sección 4). El inventario de la sección 1 describe la situación ANTES de la Fase 0.
> Objetivo: que la web siga funcionando al 100 % pero sobre cuentas de Vercel y Supabase
> (y del resto de servicios) que sean de Assets Golden, y que ellos asuman los costes.

---

## 1. Inventario real (verificado en Supabase, Vercel, GitHub, Resend y DNS)

### 1.1 Código y hosting

| Pieza | Dónde está hoy | Titular | Notas |
|---|---|---|---|
| Repositorio | GitHub `I-Bott/assets-golden-next` (privado, rama `main`) | Ivan | Vercel despliega desde acá. 3 workflows de GitHub Actions actúan como cron. |
| Hosting | Vercel team "i-bott's projects" (plan **Pro**), proyecto `assets-golden-next`, región `cdg1`, Node 24 | Ivan | 21 variables de entorno en Production. Dominio `assetsgolden.com` asignado al proyecto. `vercel.json` sin crons. |
| Base de datos / Auth / Storage | Supabase org `ltptfxvqaebyxlwrxwzn` (plan **Pro**), proyecto `mromkwpqrxpxbbxhdofs`, región eu-west-1, Postgres 17 | Ivan | DB 51 MB · 12 tablas · 28 migraciones aplicadas · 18 usuarios Auth (2 admin: `admin@assetsgolden.com`, `joanp@assetsgolden.com`; 16 agentes) · Storage 3,35 GB en 2.169 objetos (6 buckets, `property-images` = 3,3 GB) · sin Edge Functions · sin pg_cron. |
| Dominio y correo | Registrador y DNS en **IONOS** (ns *.ui-dns.*). MX en IONOS. A → Vercel (216.198.79.1). TXT: SPF IONOS, verificación Resend, verificación Facebook, DKIM Resend. | A confirmar (probablemente Atilio: el correo de la empresa vive ahí) | El dominio NO está en el registrador de Vercel ("Third Party"). |

### 1.2 Proyectos Supabase "fantasma"

| Proyecto | Uso real | Riesgo |
|---|---|---|
| `wloneprkibfjioxwypaw` (Lovable, **no está en la cuenta de Ivan**) | **894 URLs de imagen en 58 propiedades visibles**, portadas de blog, fotos de equipo, imágenes de destinos y la imagen OG del `layout.tsx` | Nadie del equipo actual controla esa cuenta. Si se pausa o borra, se rompen esas imágenes. Hay que re-hostearlas al proyecto principal ANTES de entregar. |
| `yagrwbmsufpvjcgxkuoz` | 0 referencias en la base de datos; solo aparece en `next.config.ts` y `optimizedImage.ts` | Limpieza de configuración, sin riesgo. |

### 1.3 Servicios externos conectados

| Servicio | Para qué | Cuenta actual | Cómo se conecta |
|---|---|---|---|
| **Resend** | Aviso de lead a `hola@assetsgolden.com`; emails de bienvenida y secuencia de nurture desde `atilio@assetsgolden.com` | Ivan (dominio `assetsgolden.com` verificado el 09/06, 2 API keys) | `RESEND_API_KEY` + registros DKIM/TXT en IONOS |
| **Google Cloud + Sheets** | Cada lead se añade a un Google Sheet ("Contactos Web") y los leads de Meta a otro Sheet | Service account `assets-golden-sheets@agencia-automatizacion-490823` (proyecto GCP de la agencia de Ivan) | `GOOGLE_SHEETS_CREDENTIALS_JSON`, `GOOGLE_SHEETS_LEADS_ID`, `META_LEADS_SHEET_ID`. Propietario de los 2 Sheets: **sin confirmar** (la Drive API del proyecto está deshabilitada). |
| **Meta** | Pixel `1009529298161262` + Conversions API; sync de Meta Lead Ads → Sheet; secuencia de emails | Business Manager: **sin confirmar de quién es** | `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, `META_LEADS_SYNC_TOKEN`, `META_LEADS_FORM_ID(S)`, `META_LEADS_CRON_SECRET` |
| **Upstash Redis** | Rate limiting de endpoints admin/sync | Ivan | `UPSTASH_REDIS_REST_URL/TOKEN`. Si faltan, la app sigue funcionando sin rate limit. |
| **n8n (webhook)** | Copia de cada lead a un webhook (fire and forget) | Instancia de Ivan; hoy **no responde** (timeout) | `N8N_WEBHOOK_URL` (está cargada en Vercel). |
| **GitHub Actions** | Cron: sync HabiHub semanal, sync Meta leads cada hora, secuencia diaria | Repo de Ivan | Secrets `CRON_SECRET` y `META_LEADS_CRON_SECRET`. **Apuntan a `assets-golden-next.vercel.app`**, no al dominio. |
| **HabiHub / medianewbuild** | Feed XML de obra nueva (101.177 fotos servidas desde su CDN vía proxy wsrv.nl) | Cuenta de agente HabiHub (UUID en la URL del feed) | `HABIHUB_FEED_BLANCA_CALIDA`, `HABIHUB_FEED_SOL` |
| **Cervera** | Importación de promociones de Miami | API pública, sin cuenta | Script manual |
| **wsrv.nl** | Proxy de imágenes del feed | Sin cuenta | Reversible vaciando `PROXIED_HOSTS` |
| **GA4 / Search Console** | Analítica y SEO | Ya bajo `assetsgolden1@gmail.com` (Atilio) | `NEXT_PUBLIC_GA_MEASUREMENT_ID` (con fallback hardcodeado) |
| **Vercel BotID** | Anti-bot en los 3 endpoints de formularios | Va con el proyecto de Vercel | Sin variables |
| **Chromium remoto** | PDF del portal (`@sparticuz/chromium-min` 143.0.4 descargado de GitHub Releases) | Sin cuenta | `maxDuration = 60`, runtime Node |

Variables en Vercel que el código **ya no usa** (limpiar): `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `META_SYSTEM_USER_TOKEN`.

### 1.4 Formularios y a dónde va cada envío

Los 6 formularios públicos (contacto, mi demanda, "tengo un activo", colabora, demanda desde ficha, contacto desde ficha) llaman a 3 endpoints: `/api/leads`, `/api/demands`, `/api/collaborations`. Cada envío hace, en orden:

1. INSERT en `public.leads` de Supabase (service role).
2. Fila en el Google Sheet "Contactos Web".
3. POST al webhook n8n (si la variable existe).
4. Email por Resend a `hola@assetsgolden.com`.
5. Evento `generate_lead` en GA4 y `Lead` en Meta Pixel + CAPI (desde el cliente).

Además: reset de contraseña de agentes vía Supabase Auth (SMTP de Supabase salvo que haya SMTP propio configurado en el dashboard), alta de agentes con email de bienvenida por Resend.

### 1.5 Por qué las cuentas nuevas tienen que ser de pago

- **Vercel Pro**: el proyecto ya chocó dos veces con el plan Hobby (644K ISR Writes vs 200K el 13/07; deploy bloqueado el 07/08). Hay ~2.600 fichas prerenderizadas + PDF con Chromium en funciones de 60 s.
- **Supabase Pro**: Image Transformation (todas las fotos propias se sirven así) solo existe en Pro; Storage 3,35 GB supera el 1 GB del Free; el Free pausa proyectos inactivos.

Coste aproximado mensual: Vercel Pro ~20 USD por asiento + Supabase Pro ~25 USD (incluye créditos de cómputo para el Micro actual; storage y egress dentro de lo incluido hoy). Resend, Upstash, GCP y GitHub caben en free tier. IONOS ya lo pagan ellos.

---

## 2. Estrategia recomendada: TRANSFERIR, no clonar

Las dos plataformas permiten mover el proyecto tal cual a otra organización/equipo. Eso evita copiar 3,35 GB de imágenes, reescribir 2.219 URLs en la base, regenerar claves y arriesgar downtime o SEO.

### Supabase — Project Transfer (documentación oficial, verificada)
- Se inicia desde *Project Settings → General → Transfer project*.
- Requisitos: Ivan debe ser **Owner** de la org origen (lo es) y **al menos miembro** de la org destino (Atilio lo invita). El proyecto no debe tener integración GitHub activa, roles por proyecto ni log drains (no tiene ninguno de los tres).
- **Sin downtime** si la org destino está en Pro. Si fuera Free hay 1–2 min de corte y se pierden Image Transformations: por eso la org destino se pone en Pro ANTES.
- La URL `mromkwpqrxpxbbxhdofs.supabase.co`, las claves, los usuarios, RLS, Storage y las imágenes quedan exactamente igual. **No hay que tocar código ni variables por esto.**
- El uso hasta el momento del transfer se factura a la org de Ivan; después, a la de AG.

### Vercel — Project Transfer entre teams
- Se inicia desde *Project Settings → General → Transfer* y genera un código válido 24 h que el team destino acepta.
- Van con el proyecto: dominios, variables de entorno, deployments, configuración. El team destino debe estar en Pro (el transfer pide confirmar las "paid features").
- Lo que hay que rehacer: la **conexión Git** (el repo tiene que ser accesible por el team nuevo) y comprobar el subdominio `*.vercel.app` (puede cambiar; por eso los workflows deben apuntar a `assetsgolden.com`).
- El DNS en IONOS no cambia: el registro A ya apunta a Vercel y el dominio se mueve con el proyecto.

### Plan B (solo si un transfer queda bloqueado): clonar
Nuevo proyecto Supabase + backup/restore (incluido `auth` con hashes de contraseñas) + copia de Storage + reescritura de host en 2.219 URLs de DB, `next.config.ts`, `layout.tsx`, CSP y `optimizedImage.ts` + claves nuevas; nuevo proyecto Vercel + variables + dominio. Es 1–2 días de trabajo con ventana de riesgo. No lo recomiendo salvo bloqueo.

---

## 3. Decisiones tomadas (Ivan, 05/09/2026)

1. **Transfer**, no clonado.
2. **Email titular**: una cuenta que creó Ivan para Assets Golden. Ivan les pasa usuario y contraseña a Atilio y Joan. Esa misma cuenta es la titular de GitHub, Vercel, Supabase, Resend, Google Cloud y Upstash. Recomendación que sigue en pie: activar 2FA con un método al que lleguen los tres (app de autenticación en el móvil de Atilio + códigos de respaldo guardados).
3. **Acceso de Ivan**: conserva el acceso con esa misma cuenta (es la que conecta GitHub, Vercel y Supabase a Claude). No hace falta invitar una segunda identidad. Efecto colateral positivo: en Vercel Pro se paga por asiento, y una sola cuenta compartida = un asiento.
4. **Repo GitHub**: se transfiere a la cuenta de GitHub que Ivan creó para Atilio (es lo habitual: el cliente es dueño del código, el proveedor colabora). El historial y los workflows se conservan; los 2 secrets de Actions se recrean.
5. **n8n**: se elimina. Nunca se usó. Se borra `N8N_WEBHOOK_URL` de Vercel y el bloque de código que la lee en los 3 endpoints y en `queries.ts`.
6. **Google Sheets**: los 2 Sheets son de Ivan (compartidos con AG). Se crean 2 Sheets nuevos propiedad de la cuenta nueva, con las mismas pestañas y cabeceras, y se cambian los IDs en Vercel. El histórico se copia a mano si interesa. **Meta**: el Business Manager, el Pixel, los formularios de Lead Ads y los tokens siguen siendo de Ivan por ahora. **Queda fuera del alcance de esta migración**; se resolverá más adelante. Mientras tanto los tokens actuales siguen funcionando en el proyecto transferido.
7. **Rotación de claves tras la entrega**: sí (service role de Supabase, JSON de la service account; los de Meta no, porque siguen en el BM de Ivan).

---

## 4. Fases propuestas

### Fase 0 — Preparación en código (Ivan, antes de tocar cuentas) — ✅ HECHA 05/09/2026
- [x] Re-hostear al proyecto principal las 894 imágenes de `wloneprkibfjioxwypaw` (58 propiedades, blog, equipo, destinos) + la imagen OG del layout. Ya existe el script del 03/07 para esto. Verificar 0 referencias con SQL.
- [x] Quitar `yagrwbmsufpvjcgxkuoz` y `wloneprkibfjioxwypaw` de `next.config.ts`, CSP, preconnect y `optimizedImage.ts`.
- [x] Cambiar las URLs de los 3 workflows de GitHub Actions a `https://assetsgolden.com/...`.
- [x] Quitar n8n del código (3 endpoints + `queries.ts`) y de `env.production.example`.
- [x] Borrar de Vercel las 4 variables sin uso (Turnstile ×2, `META_SYSTEM_USER_TOKEN`, `N8N_WEBHOOK_URL`).
- [x] Exportar las variables de Production fuera del repo (`vercel env pull` → `../backups-migracion-2026-09/`). Ojo: 15 son "Sensitive" y Vercel no deja leerlas; viajan con el transfer. Las que no están en `.env.local` (Upstash ×2, `CRON_SECRET`, `META_LEADS_FORM_IDS`) se regeneran si hiciera falta.
- [x] Backup: las 12 tablas + lista de usuarios Auth en JSON (34 MB) en `../backups-migracion-2026-09/`; Supabase Pro además tiene backups diarios. DNS de IONOS capturado en la sección 1.1.
- [x] Deploy y verificación en producción de los cambios anteriores (con SHA correcto).

### Fase 1 — Cuentas nuevas (Atilio/Joan, con Ivan al lado)
- [ ] Cuenta de email nueva (ya creada por Ivan) + 2FA con códigos de respaldo compartidos.
- [ ] GitHub: la cuenta creada para Atilio. Ivan la conecta a Claude Code.
- [ ] Vercel: team nuevo en **Pro** con tarjeta de la empresa, registrado con la cuenta nueva.
- [ ] Supabase: organización nueva en **Pro** con tarjeta de la empresa, registrada con la cuenta nueva. Invitar a la cuenta de Ivan (necesario para poder ejecutar el transfer desde la org origen).
- [ ] Resend, Google Cloud (proyecto nuevo + service account + Sheets API + 2 Sheets nuevos), Upstash (si se mantiene el rate limit).
- [ ] Confirmar acceso a IONOS con Atilio (DNS para el DKIM de Resend).

### Fase 2 — Transfer de Supabase — ✅ HECHA 20/09/2026 (org nueva `ssgcgkjdcweuabyvswbq`, Pro)
- [x] Ivan transfiere `mromkwpqrxpxbbxhdofs` a la org de AG.
- [x] Verificado tras el transfer (web 200, storage raw + transform webp, REST anon y service role 200, Auth health 200, proyecto ACTIVE_HEALTHY). Pendiente de prueba humana: login admin/portal. Original: web en producción sigue sirviendo fichas e imágenes (transform), login admin y portal, `/api/admin/test-sheets`, advisors de seguridad sin cambios.
- [ ] Revisar en el dashboard nuevo: SMTP de Auth, URL de redirección de Auth, leaked-password protection, límite de tamaño del bucket.

### Fase 3 — Transfer de Vercel y GitHub — ✅ HECHA 20/09/2026
- [ ] Transferir el repo a la org de AG; recrear los 2 secrets de Actions; lanzar los 3 workflows a mano y comprobar 200.
- [ ] Transferir el proyecto Vercel al team nuevo; aceptar en 24 h.
- [ ] Reconectar Git (repo nuevo) y confirmar que las 21 variables, el dominio y la protección BotID siguen.
- [ ] Redeploy de `main` y verificación con el SHA correcto: home, ficha, listado, sitemap, `/admin`, `/portal`, PDF.
- [ ] Ivan re-linkea su copia local (`.vercel/`) al proyecto nuevo.

### Fase 4 — Servicios externos (uno por uno, con prueba de cada uno)
- [ ] **Resend**: añadir `assetsgolden.com` en la cuenta nueva → reemplazar DKIM/TXT en IONOS → verificar → API key nueva → `RESEND_API_KEY` en Vercel → redeploy → enviar un formulario y ver el email en `hola@`. Después, borrar las keys viejas en la cuenta de Ivan.
- [ ] **Google Sheets**: crear los 2 Sheets nuevos con la cuenta nueva (mismas pestañas y cabeceras: "Contactos Web" y el de Meta leads con pestañas `LEADS` y `CRM`) → compartirlos con la service account nueva (Editor) → `GOOGLE_SHEETS_CREDENTIALS_JSON`, `GOOGLE_SHEETS_LEADS_ID` y `META_LEADS_SHEET_ID` nuevos → probar `/api/admin/test-sheets` → copiar el histórico a mano si se quiere. Ojo: el sync de Meta deduplica leyendo emails del Sheet nuevo; al arrancar vacío puede volver a volcar los 64 leads ya sincronizados (la tabla `meta_leads_synced` los frena por ID, así que no debería, pero se verifica con una corrida manual).
- [ ] **Meta**: sin cambios en esta migración (decisión 6). Los tokens actuales siguen en Vercel y siguen funcionando. Pendiente futuro: mover Pixel, formularios y System User a un BM de AG.
- [ ] **Upstash**: base nueva → 2 variables → o eliminar el rate limit conscientemente.
- [ ] **n8n**: ya eliminado en Fase 0.
- [ ] **HabiHub**: confirmar que el agente del feed es la cuenta de AG; dry-run del sync.

### Fase 5 — Validación end-to-end en producción
- [ ] Los 6 formularios: fila en `leads`, fila en el Sheet, email en `hola@`, `generate_lead` en GA4 tiempo real, `Lead` en Events Manager.
- [ ] Login admin (Atilio y Joan), alta/edición de propiedad con subida de foto, portal de agente + PDF.
- [ ] Sync HabiHub (dry-run), sync Meta, secuencia (manual).
- [ ] Sitemap, robots, redirecciones 308 de slugs legacy, hreflang.
- [ ] `grep` final en repo y en variables: cero referencias a cuentas de Ivan (GCP `agencia-automatizacion`, Upstash, n8n, proyectos Supabase viejos).

### Fase 6 — Cierre y entrega
- [ ] Rotar claves (decisión 7) y actualizar Vercel.
- [ ] Documento de entrega: lista de cuentas, quién es owner, dónde se paga cada cosa, cómo dar de alta un agente, cómo correr los crons, contactos de soporte.
- [ ] Actualizar `ESTADO.md`, `PENDIENTES.md` y `DAILY_LOG.md`.
- [ ] Bajar el rol de Ivan al acordado y eliminar los recursos huérfanos en sus cuentas (Resend keys, Upstash, service account vieja).

---

## 5. Riesgos y cómo se cubren

| Riesgo | Cobertura |
|---|---|
| Transfer de Supabase a org Free → corte + pérdida de transforms | Org destino en Pro antes de transferir. |
| Cambio de DKIM de Resend rompe los emails unas horas | Hacerlo en horario de baja actividad; verificar antes de borrar las keys viejas; los leads igual quedan en Supabase y Sheet. |
| Workflows de Actions dejan de llegar por cambio de subdominio `.vercel.app` | Fase 0 los pasa al dominio propio. |
| Imágenes del proyecto Lovable desaparecen | Fase 0 las re-hostea antes de la entrega. |
| Vercel bloquea por límites | Team destino en Pro con método de pago válido desde el día 1. |
| Pérdida de acceso de Ivan a mitad de proceso | Ivan queda como miembro de todas las cuentas hasta la Fase 6. |
