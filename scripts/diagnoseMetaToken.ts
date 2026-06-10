/**
 * FASE-2-DIAG-META — Diagnóstico exhaustivo del token y Form ID de Meta Lead Ads.
 * Uso: npx tsx --env-file=.env.local scripts/diagnoseMetaToken.ts
 *
 * Ejecuta 9 tests contra la Graph API de Meta para identificar:
 *  - Qué permisos tiene el token actual
 *  - Si se puede obtener un Page Access Token
 *  - Cuál es el Form ID real del formulario "Marbella-NewBuild-EN-v1"
 *  - Si el Form ID actual (1495878108643736) es accesible
 *
 * Guarda el resultado completo en outputs/meta-token-diagnosis-YYYY-MM-DD.json
 */

import fs from 'fs'
import path from 'path'

const META_GRAPH_BASE = 'https://graph.facebook.com/v19.0'
const PAGE_ID = '1140251872501979'
const AD_ACCOUNT_ID = 'act_1779832132998723'
const FORM_ID_CURRENT = '1495878108643736'
const AD_ID_ACTIVE = '6999816973076'
const TARGET_FORM_NAME = 'Marbella-NewBuild-EN-v1'

interface TestResult {
  test: string
  url_redacted: string
  status: number | null
  body: unknown
  error?: {
    code?: number
    subcode?: number
    message?: string
    fbtrace_id?: string
  }
  success: boolean
}

function redactToken(url: string): string {
  return url.replace(/access_token=[^&\s]+/g, 'access_token=REDACTED')
}

async function runTest(name: string, url: string, token: string): Promise<TestResult> {
  const separator = url.includes('?') ? '&' : '?'
  const fullUrl = `${url}${separator}access_token=${token}`
  const urlRedacted = redactToken(fullUrl)

  console.log(`\n🔍 ${name}`)
  console.log(`   URL: ${urlRedacted}`)

  try {
    const res = await fetch(fullUrl, { signal: AbortSignal.timeout(15000) })
    const body = (await res.json()) as unknown

    console.log(`   Status HTTP: ${res.status}`)

    if (!res.ok) {
      const err = (body as Record<string, unknown> | null)?.error as
        | Record<string, unknown>
        | undefined
      const errMsg = String(err?.message ?? JSON.stringify(body)).slice(0, 200)
      console.log(`   ❌ Error: ${errMsg}`)
      if (err?.code) {
        console.log(
          `   Code: ${err.code}  Subcode: ${err.error_subcode ?? 'N/A'}  Trace: ${err.fbtrace_id ?? 'N/A'}`,
        )
      }
      return {
        test: name,
        url_redacted: urlRedacted,
        status: res.status,
        body,
        error: {
          code: err?.code as number | undefined,
          subcode: err?.error_subcode as number | undefined,
          message: err?.message as string | undefined,
          fbtrace_id: err?.fbtrace_id as string | undefined,
        },
        success: false,
      }
    }

    const preview = JSON.stringify(body).slice(0, 250)
    console.log(`   ✅ OK — ${preview}`)

    return {
      test: name,
      url_redacted: urlRedacted,
      status: res.status,
      body,
      success: true,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.log(`   ❌ Fetch error: ${msg}`)
    return {
      test: name,
      url_redacted: urlRedacted,
      status: null,
      body: null,
      error: { message: msg },
      success: false,
    }
  }
}

// ─── Helpers de extracción segura ────────────────────────────────────────────

type JsonObject = Record<string, unknown>

function asObj(v: unknown): JsonObject | null {
  return v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as JsonObject) : null
}

function asArr(v: unknown): unknown[] | null {
  return Array.isArray(v) ? v : null
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const token = process.env.META_LEADS_SYNC_TOKEN
  if (!token) {
    console.error(
      '❌ META_LEADS_SYNC_TOKEN no está en el entorno. Ejecutar con --env-file=.env.local',
    )
    process.exit(1)
  }

  const sep = '='.repeat(70)
  console.log(sep)
  console.log('FASE-2-DIAG-META — Diagnóstico exhaustivo token + Form ID')
  console.log(`Fecha: ${new Date().toISOString()}`)
  console.log(`Token (primeros 20 chars): ${token.slice(0, 20)}...`)
  console.log(sep)

  // ─── FASE 1: 8 tests en paralelo (todo excepto "e" que depende de d/c) ───
  console.log('\n\n📡 FASE 1 — Ejecutando 8 tests en paralelo...')

  const [a, b, c, d, f, g, h, i] = await Promise.all([
    runTest('(a) GET /me — info System User', `${META_GRAPH_BASE}/me`, token),

    runTest('(b) GET /me/permissions — permisos granted', `${META_GRAPH_BASE}/me/permissions`, token),

    runTest(
      '(c) GET /me/accounts — Page Access Token derivado',
      `${META_GRAPH_BASE}/me/accounts?limit=25`,
      token,
    ),

    runTest(
      `(d) GET /<page_id>?fields=access_token,id,name`,
      `${META_GRAPH_BASE}/${PAGE_ID}?fields=access_token,id,name`,
      token,
    ),

    runTest(
      `(f) GET /<form_id> directo (${FORM_ID_CURRENT})`,
      `${META_GRAPH_BASE}/${FORM_ID_CURRENT}`,
      token,
    ),

    runTest(
      `(g) GET /<form_id>/leads (${FORM_ID_CURRENT})`,
      `${META_GRAPH_BASE}/${FORM_ID_CURRENT}/leads?limit=3&fields=id,created_time,field_data`,
      token,
    ),

    runTest(
      `(h) GET /${AD_ACCOUNT_ID}/customaudiences — sanity check ads`,
      `${META_GRAPH_BASE}/${AD_ACCOUNT_ID}/customaudiences?limit=1`,
      token,
    ),

    runTest(
      `(i) GET /<ad_id> spec (${AD_ID_ACTIVE})`,
      `${META_GRAPH_BASE}/${AD_ID_ACTIVE}?fields=id,name,creative{object_story_spec}`,
      token,
    ),
  ])

  // ─── FASE 2: Test (e) — necesita Page Access Token de d o c ──────────────
  console.log('\n\n📡 FASE 2 — Obteniendo leadgen_forms con Page Access Token...')

  let pageAccessToken: string | undefined
  let pageAccessTokenSource: string | undefined

  // Intentar obtener el PAT del test (d) primero
  const dBody = asObj(d.body)
  if (d.success && typeof dBody?.access_token === 'string') {
    pageAccessToken = dBody.access_token
    pageAccessTokenSource = 'test_d (GET /<page_id>?fields=access_token)'
    console.log(`   PAT obtenido de (d): ${pageAccessToken.slice(0, 20)}...`)
  }

  // Si no, intentar de (c) /me/accounts
  if (!pageAccessToken) {
    const cBody = asObj(c.body)
    const accounts = asArr(cBody?.data)
    if (c.success && accounts) {
      for (const acc of accounts) {
        const accObj = asObj(acc)
        if (accObj?.id === PAGE_ID && typeof accObj?.access_token === 'string') {
          pageAccessToken = accObj.access_token
          pageAccessTokenSource = 'test_c (GET /me/accounts)'
          console.log(`   PAT obtenido de (c): ${pageAccessToken.slice(0, 20)}...`)
          break
        }
      }
    }
  }

  let e: TestResult
  if (pageAccessToken) {
    e = await runTest(
      `(e) GET /<page_id>/leadgen_forms (con Page Access Token)`,
      `${META_GRAPH_BASE}/${PAGE_ID}/leadgen_forms?fields=id,name,status,leads_count`,
      pageAccessToken,
    )
  } else {
    console.log('   ⚠️  No hay PAT disponible — usando System User Token como fallback')
    e = await runTest(
      `(e) GET /<page_id>/leadgen_forms (fallback: System User Token)`,
      `${META_GRAPH_BASE}/${PAGE_ID}/leadgen_forms?fields=id,name,status,leads_count`,
      token,
    )
  }

  // ─── ANÁLISIS ─────────────────────────────────────────────────────────────
  console.log('\n\n🔎 ANÁLISIS...')

  interface LeadForm {
    id: string
    name: string
    status?: string
    leads_count?: number
  }

  let leadFormsList: LeadForm[] | undefined
  let recommendedFormId: string | undefined

  if (e.success) {
    const eBody = asObj(e.body)
    const data = asArr(eBody?.data)
    if (data) {
      leadFormsList = data
        .map(item => asObj(item))
        .filter(Boolean)
        .map(item => ({
          id: String(item!.id ?? ''),
          name: String(item!.name ?? ''),
          status: item!.status !== undefined ? String(item!.status) : undefined,
          leads_count:
            typeof item!.leads_count === 'number' ? item!.leads_count : undefined,
        }))

      console.log(`   Formularios encontrados (${leadFormsList.length}):`)
      for (const form of leadFormsList) {
        console.log(
          `     - ID: ${form.id}  Nombre: "${form.name}"  Status: ${form.status ?? '?'}  Leads: ${form.leads_count ?? '?'}`,
        )
      }

      const target = leadFormsList.find(
        form =>
          form.name === TARGET_FORM_NAME ||
          form.name.toLowerCase().includes('marbella') ||
          form.name.toLowerCase().includes('newbuild'),
      )

      if (target) {
        recommendedFormId = target.id
        console.log(`\n   ✅ Formulario "${target.name}" encontrado — Form ID: ${recommendedFormId}`)
      } else {
        console.log(`\n   ⚠️  Formulario "${TARGET_FORM_NAME}" no encontrado en la lista`)
      }
    }
  }

  const formCurrentAccessible = f.success || g.success

  // Construir next_action
  let nextAction: string
  if (recommendedFormId && recommendedFormId !== FORM_ID_CURRENT) {
    nextAction =
      `ACTUALIZAR Form ID: el formulario "${TARGET_FORM_NAME}" tiene ID ${recommendedFormId} (actual en config: ${FORM_ID_CURRENT}). ` +
      `Pasos: (1) actualizar META_LEADS_FORM_ID=${recommendedFormId} en .env.local, ` +
      `(2) actualizar en Vercel → Settings → Environment Variables, ` +
      `(3) ejecutar POST /api/leads/sync-meta/manual.`
  } else if (recommendedFormId && recommendedFormId === FORM_ID_CURRENT) {
    nextAction =
      `Form ID actual (${FORM_ID_CURRENT}) es CORRECTO. ` +
      `El problema está en el token o sus permisos. Verificar test (b) /me/permissions para confirmar leads_retrieval.`
  } else if (!e.success && !pageAccessToken) {
    nextAction =
      `El System User Token no puede obtener el Page Access Token (tests c y d fallaron). ` +
      `En Meta Business Manager → Settings → System Users → ${process.env.META_LEADS_SYSTEM_USER_ID ?? 'System User'} → ` +
      `verificar que tenga rol "Editor" o "Administrador" en la Page Assets Golden International (ID ${PAGE_ID}). ` +
      `Alternativamente, agregar el System User a la Page desde Business Settings → Pages → <Página> → Agregar usuarios.`
  } else if (!e.success && pageAccessToken) {
    nextAction =
      `Se obtuvo Page Access Token pero /leadgen_forms falló. Error: "${e.error?.message ?? 'desconocido'}". ` +
      `Causas posibles: (a) la página no tiene formularios LeadGen, (b) el formulario pertenece a otra página, ` +
      `(c) el token no tiene permiso leads_retrieval sobre esta página específica.`
  } else if (leadFormsList?.length === 0) {
    nextAction =
      `La página ID ${PAGE_ID} no tiene formularios LeadGen activos. ` +
      `Verificar en Meta Ads Manager → Lead Ads Forms que el formulario existe y está asociado a esta página.`
  } else {
    nextAction =
      `Formulario "${TARGET_FORM_NAME}" no encontrado. ` +
      `Formularios disponibles: ${leadFormsList?.map(f => `"${f.name}" (${f.id})`).join(', ') ?? 'ninguno'}. ` +
      `Verificar el nombre exacto en Meta Ads Manager y actualizar la configuración con el ID correcto.`
  }

  // ─── OUTPUT JSON ──────────────────────────────────────────────────────────
  const dateStr = new Date().toISOString().split('T')[0]
  const outputDir = path.join(process.cwd(), 'outputs')
  const outputPath = path.join(outputDir, `meta-token-diagnosis-${dateStr}.json`)

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const jsonOutput = {
    diagnosis_date: new Date().toISOString(),
    token_prefix: `${token.slice(0, 20)}...`,
    config: {
      page_id: PAGE_ID,
      form_id_current: FORM_ID_CURRENT,
      ad_account_id: AD_ACCOUNT_ID,
      ad_id_active: AD_ID_ACTIVE,
      target_form_name: TARGET_FORM_NAME,
    },
    summary: {
      page_access_token: pageAccessToken
        ? `${pageAccessToken.slice(0, 20)}... (source: ${pageAccessTokenSource})`
        : null,
      lead_forms_list: leadFormsList ?? null,
      form_1495878108643736_accessible: formCurrentAccessible,
      recommended_form_id: recommendedFormId ?? null,
      next_action: nextAction,
    },
    tests: { a, b, c, d, e, f, g, h, i },
  }

  fs.writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2), 'utf-8')

  // ─── REPORTE FINAL EN CONSOLA ─────────────────────────────────────────────
  console.log('\n\n' + sep)
  console.log('📄 REPORTE FINAL')
  console.log(sep)
  console.log(`\n📁 JSON guardado en: ${outputPath}`)

  const tests = [
    { label: '(a) /me', r: a },
    { label: '(b) /me/permissions', r: b },
    { label: '(c) /me/accounts', r: c },
    { label: '(d) page access_token', r: d },
    { label: '(e) leadgen_forms', r: e },
    { label: '(f) form ID directo', r: f },
    { label: '(g) form ID leads', r: g },
    { label: '(h) customaudiences', r: h },
    { label: '(i) ad spec', r: i },
  ]

  console.log('\n📋 Tabla de resultados:')
  console.log(`   ${'Test'.padEnd(26)} Status  Resultado`)
  console.log(`   ${'─'.repeat(60)}`)
  for (const { label, r } of tests) {
    const icon = r.success ? '✅' : '❌'
    const status = r.status !== null ? String(r.status) : 'ERR'
    const detail = r.success
      ? 'OK'
      : (r.error?.message?.slice(0, 40) ?? 'error')
    console.log(`   ${icon} ${label.padEnd(24)} ${status.padEnd(8)} ${detail}`)
  }

  console.log('\n📊 Análisis:')
  console.log(
    `   • Page Access Token: ${pageAccessToken ? `✅ obtenido (${pageAccessTokenSource})` : '❌ no disponible'}`,
  )
  console.log(
    `   • Leadgen forms endpoint: ${e.success ? `✅ OK — ${leadFormsList?.length ?? 0} form(s)` : `❌ falló (${e.error?.message?.slice(0, 60) ?? '?'})`}`,
  )
  console.log(
    `   • Form ID ${FORM_ID_CURRENT} accesible: ${formCurrentAccessible ? '✅ sí' : '❌ no'}`,
  )
  console.log(
    `   • Form ID recomendado: ${recommendedFormId ? `✅ ${recommendedFormId}` : '❌ no encontrado'}`,
  )
  if (recommendedFormId) {
    const changed = recommendedFormId !== FORM_ID_CURRENT
    console.log(
      `   • ¿Cambiar Form ID?: ${changed ? `⚠️  SÍ — de ${FORM_ID_CURRENT} a ${recommendedFormId}` : '✅ no necesario (correcto)'}`,
    )
  }

  console.log('\n🎯 Próximo paso:')
  console.log(`   ${nextAction}`)

  console.log('\n🔧 Comando sync manual (después de resolver Form ID):')
  console.log(
    `   curl -X POST https://assets-golden-next.vercel.app/api/leads/sync-meta/manual \\`,
  )
  console.log(`     -H "Authorization: Bearer [META_LEADS_CRON_SECRET]" \\`)
  console.log(`     -H "Content-Type: application/json"`)

  console.log('\n' + sep + '\n')
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
