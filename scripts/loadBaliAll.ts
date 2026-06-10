/** FASE-4.N-P7 -- Carga masiva Bali (resto del CSV)
 * Uso: npx tsx --env-file=.env.local scripts/loadBaliAll.ts
 * Idempotente: SKIP si external_id ya existe o sin fotos.
 * Append a scripts/output/bali-carga-log.json.
 */

import { createClient } from "@supabase/supabase-js"
import { parse } from "csv-parse/sync"
import * as fs from "fs"
import * as path from "path"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const CSV_PATH   = path.join(__dirname, "output", "bali-carga-final.csv")
const FOTOS_BASE = path.join(__dirname, "output", "bali-fotos")
const LOG_PATH   = path.join(__dirname, "output", "bali-carga-log.json")

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
  return base + "-" + Date.now().toString(36)
}

function sanitizeExt(filename: string): string {
  const rawExt = filename.includes(".") ? (filename.split(".").pop() ?? "") : ""
  return /^[a-zA-Z0-9]{1,5}$/.test(rawExt) ? rawExt.toLowerCase() : "jpg"
}

async function uploadPhoto(filePath: string): Promise<string> {
  const filename    = path.basename(filePath)
  const ext         = sanitizeExt(filename)
  const storagePath = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer      = fs.readFileSync(filePath)
  const ct          = `image/${ext === "jpg" ? "jpeg" : ext}`
  const { error }   = await supabase.storage
    .from("property-images")
    .upload(storagePath, buffer, { contentType: ct, upsert: true })
  if (error) throw new Error(`Upload failed for ${filename}: ${error.message}`)
  const { data: u } = supabase.storage.from("property-images").getPublicUrl(storagePath)
  return u.publicUrl
}

interface CsvRow {
  title_es: string; property_type: string; price: string; currency: string
  location: string; bedrooms: string; bathrooms: string; area_sqm: string
  external_id: string; descripcion_es: string; nota: string
}

interface InsertResult {
  external_id: string; status: "ok" | "skip_exists" | "skip_no_photos" | "error"
  reason?: string; id?: string; ref_code?: string | null
  slug?: string; gallery_urls_count?: number; image_url?: string
}

async function main() {
  console.log("================================================")
  console.log("  FASE-4.N-P7 -- Carga masiva Bali")
  console.log("================================================")

  const rows: CsvRow[] = parse(fs.readFileSync(CSV_PATH, "utf-8"), {
    columns: true, skip_empty_lines: true, trim: true,
  })
  console.log(`\nCSV: ${rows.length} filas`)

  const { data: existing } = await supabase
    .from("properties")
    .select("external_id")
    .eq("external_source", "prestige-bali")
  const existingIds = new Set(
    (existing ?? []).map((r: { external_id: string | null }) => r.external_id).filter(Boolean)
  )
  console.log(`DB: ${existingIds.size} ya existen con external_source=prestige-bali`)

  const results: InsertResult[] = []
  let countOk = 0, countExists = 0, countNoPhotos = 0
  const okRefCodes: string[] = []

  for (const row of rows) {
    const eid = row.external_id
    console.log(`\n--- ${eid}: ${row.title_es.slice(0, 55)} ---`)

    if (existingIds.has(eid)) {
      console.log("  SKIP -- ya existe en DB")
      results.push({ external_id: eid, status: "skip_exists", reason: "ya existe" })
      countExists++
      continue
    }

    const allFolders = fs.readdirSync(FOTOS_BASE)
    const folder     = allFolders.find(f => f.startsWith(eid + "_"))

    if (!folder) {
      console.log("  SKIP -- sin carpeta de fotos")
      results.push({ external_id: eid, status: "skip_no_photos", reason: "sin carpeta" })
      countNoPhotos++
      continue
    }

    const folderPath = path.join(FOTOS_BASE, folder)
    const imgFiles   = fs.readdirSync(folderPath)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .sort()

    if (imgFiles.length === 0) {
      console.log("  SKIP -- carpeta vacia")
      results.push({ external_id: eid, status: "skip_no_photos", reason: `carpeta vacia: ${folder}` })
      countNoPhotos++
      continue
    }

    console.log(`  Subiendo ${imgFiles.length} fotos...`)
    const uploadedUrls: string[] = []
    for (let i = 0; i < imgFiles.length; i++) {
      const fp = path.join(folderPath, imgFiles[i])
      process.stdout.write(`    [${String(i + 1).padStart(2, "0")}/${imgFiles.length}] ${imgFiles[i]} ... `)
      const url = await uploadPhoto(fp)
      uploadedUrls.push(url)
      console.log("OK")
    }

    const slug = generateSlug(row.title_es)
    console.log(`  INSERT slug=${slug}`)

    const { error: ie } = await supabase.from("properties").insert({
      title:           row.title_es,
      slug,
      property_type:   row.property_type || null,
      price:           row.price ? Number(row.price) : null,
      currency:        "USD",
      location:        row.location || null,
      province:        null,
      country:         "Indonesia",
      bedrooms:        row.bedrooms  ? parseInt(row.bedrooms,  10) : null,
      bathrooms:       row.bathrooms ? parseInt(row.bathrooms, 10) : null,
      area_sqm:        row.area_sqm  ? Number(row.area_sqm)       : null,
      description:     row.descripcion_es || null,
      external_source: "prestige-bali",
      external_id:     eid,
      status:          "active",
      hidden:          false,
      sold:            false,
      featured:        false,
      classification:  null,
      is_development:  false,
      image_url:       uploadedUrls[0] ?? null,
      gallery_urls:    uploadedUrls,
    })

    if (ie) {
      console.error(`  ERROR INSERT: ${ie.message}`)
      results.push({ external_id: eid, status: "error", reason: ie.message })
      continue
    }

    const { data: ins } = await supabase
      .from("properties")
      .select("id, ref_code, slug, image_url, gallery_urls")
      .eq("external_id", eid)
      .single()

    const gc = Array.isArray(ins?.gallery_urls) ? (ins.gallery_urls as string[]).length : 0
    console.log(`  OK -> ref_code=${ins?.ref_code}  fotos=${gc}`)
    if (ins?.ref_code) okRefCodes.push(ins.ref_code)

    results.push({
      external_id: eid, status: "ok", id: ins?.id,
      ref_code: ins?.ref_code, slug: ins?.slug,
      gallery_urls_count: gc, image_url: ins?.image_url,
    })
    countOk++
  }

  const sorted = [...okRefCodes].sort()
  console.log("\n================================================")
  console.log("  RESUMEN")
  console.log("================================================")
  console.log(`  Insertadas OK:    ${countOk}`)
  console.log(`  Skip ya-existe:   ${countExists}`)
  console.log(`  Skip sin-fotos:   ${countNoPhotos}`)
  const noP = results.filter(r => r.status === "skip_no_photos")
  if (noP.length > 0) {
    console.log("  Sin fotos (listado):")
    noP.forEach(r => console.log(`    ${r.external_id} -- ${r.reason}`))
  }
  if (sorted.length > 0) {
    console.log(`  ref_codes: ${sorted[0]} .. ${sorted[sorted.length - 1]} (${sorted.length} asignados)`)
  }

  let log: unknown[] = []
  if (fs.existsSync(LOG_PATH)) {
    try { const p = JSON.parse(fs.readFileSync(LOG_PATH, "utf-8")); log = Array.isArray(p) ? p : [p] }
    catch { log = [] }
  }
  log.push({
    run: "FASE-4.N-P7",
    timestamp: new Date().toISOString(),
    summary: {
      total_csv: rows.length,
      inserted: countOk,
      skip_exists: countExists,
      skip_no_photos: countNoPhotos,
      ref_codes_range: sorted.length > 0
        ? { from: sorted[0], to: sorted[sorted.length - 1] }
        : null,
    },
    detail: results,
  })
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2))
  console.log(`\nLog => ${LOG_PATH}`)
  console.log("CARGA COMPLETADA")
}

main().catch(err => { console.error(err); process.exit(1) })
