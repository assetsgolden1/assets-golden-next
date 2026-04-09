/**
 * Script: import-properties.ts
 * Importa 21.113 propiedades desde CSV exportado de Lovable → Supabase nuevo
 *
 * Uso:
 *   npx tsx scripts/import-properties.ts
 *
 * Requiere: SUPABASE_SERVICE_ROLE_KEY en .env.local
 */

import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import { createClient } from "@supabase/supabase-js";

// ── Cargar .env.local manualmente ──────────────────────────────────────────
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) throw new Error(".env.local no encontrado");
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    process.env[key] = val;
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Faltan credenciales en .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Config ─────────────────────────────────────────────────────────────────
const CSV_PATH = path.resolve(
  "C:/Users/Asus/Desktop/proyecto/assets-golden/web/Lovable data/properties-export-2026-04-09_22-26-47.csv"
);
const BATCH_SIZE = 100;

// ── Slug generator ─────────────────────────────────────────────────────────
const slugCounters = new Map<string, number>();

function generateSlug(title: string, location: string): string {
  const base = [title, location]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/[^a-z0-9\s-]/g, "")   // solo alfanumérico
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

  const count = slugCounters.get(base) ?? 0;
  slugCounters.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

// ── Mapeo CSV → schema ─────────────────────────────────────────────────────
function parseJsonSafe(val: string): unknown[] {
  if (!val || val === "NULL") return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseBool(val: string): boolean {
  return val?.toLowerCase() === "true";
}

function parseNum(val: string): number | null {
  if (!val || val === "NULL") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function parseIntSafe(val: string): number | null {
  if (!val || val === "NULL") return null;
  const n = global.parseInt(val, 10);
  return isNaN(n) ? null : n;
}

function normalizeStatus(val: string): string {
  const allowed = ["active", "inactive", "sold", "available", "reserved"];
  const s = (val || "active").toLowerCase();
  return allowed.includes(s) ? s : "active";
}

interface CsvRow {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  location: string;
  destination_id: string;
  bedrooms: string;
  bathrooms: string;
  area_sqm: string;
  image_url: string;
  gallery_urls: string;
  features: string;
  property_type: string;
  status: string;
  featured: string;
  created_by: string;
  idealista_url: string;
  nestseekers_url: string;
  country: string;
  is_development: string;
  classification: string;
  province: string;
}

function mapRow(row: CsvRow) {
  const title = (row.title || "").trim();
  const location = (row.location || "").trim();

  return {
    external_id:     row.id || null,
    title:           title || "Sin título",
    slug:            generateSlug(title, location),
    description:     row.description || null,
    description_en:  null,
    price:           parseNum(row.price),
    currency:        row.currency || "EUR",
    location:        location || null,
    province:        row.province || null,
    country:         row.country || "ES",
    bedrooms:        parseIntSafe(row.bedrooms),
    bathrooms:       parseIntSafe(row.bathrooms),
    area_sqm:        parseNum(row.area_sqm),
    image_url:       row.image_url || null,
    gallery_urls:    parseJsonSafe(row.gallery_urls),
    features:        parseJsonSafe(row.features),
    property_type:   row.property_type || null,
    classification:  row.classification || null,
    status:          normalizeStatus(row.status),
    is_development:  parseBool(row.is_development),
    featured:        parseBool(row.featured),
    idealista_url:   row.idealista_url || null,
    nestseekers_url: row.nestseekers_url || null,
    // destination_id: FK al proyecto anterior — omitir en migración inicial
    // created_by: omitir — no hay usuarios creados aún
    created_at:      row.created_at || new Date().toISOString(),
    updated_at:      row.updated_at || new Date().toISOString(),
  };
}

// ── Importador en lotes ────────────────────────────────────────────────────
async function importBatch(
  batch: ReturnType<typeof mapRow>[],
  batchNum: number,
  totalBatches: number
): Promise<{ ok: number; errors: number; errorDetails: string[] }> {
  const { data, error } = await supabase
    .from("properties")
    .upsert(batch, { onConflict: "external_id", ignoreDuplicates: false });

  if (error) {
    // Si falla el lote completo, intentar uno a uno para aislar errores
    console.warn(`  ⚠️  Lote ${batchNum} falló en bulk — reintentando fila a fila...`);
    let ok = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    for (const row of batch) {
      const { error: rowErr } = await supabase
        .from("properties")
        .upsert(row, { onConflict: "external_id", ignoreDuplicates: false });

      if (rowErr) {
        errors++;
        errorDetails.push(`${row.external_id}: ${rowErr.message}`);
      } else {
        ok++;
      }
    }
    return { ok, errors, errorDetails };
  }

  void data; // Supabase upsert no devuelve filas a menos que pidamos .select()
  return { ok: batch.length, errors: 0, errorDetails: [] };
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("════════════════════════════════════════");
  console.log("  Assets Golden — Importación Propiedades");
  console.log("════════════════════════════════════════");
  console.log(`📁 Fuente: ${path.basename(CSV_PATH)}`);
  console.log(`🎯 Destino: ${SUPABASE_URL}`);
  console.log(`📦 Tamaño de lote: ${BATCH_SIZE}`);
  console.log("");

  // Paso 1: leer y parsear el CSV completo
  console.log("📖 Leyendo CSV...");
  const allRows: CsvRow[] = await new Promise((resolve, reject) => {
    const rows: CsvRow[] = [];
    fs.createReadStream(CSV_PATH, { encoding: "utf-8" })
      .pipe(
        parse({
          delimiter: ";",
          columns: true,
          skip_empty_lines: true,
          relax_quotes: true,
          relax_column_count: true,
          trim: false,
        })
      )
      .on("data", (row: CsvRow) => rows.push(row))
      .on("error", reject)
      .on("end", () => resolve(rows));
  });

  console.log(`✅ CSV leído: ${allRows.length.toLocaleString()} filas\n`);

  // Paso 2: mapear todas las filas
  console.log("🔄 Mapeando columnas al schema...");
  const mapped = allRows.map(mapRow);
  const totalBatches = Math.ceil(mapped.length / BATCH_SIZE);
  console.log(`✅ ${mapped.length.toLocaleString()} propiedades mapeadas`);
  console.log(`📦 ${totalBatches} lotes de ${BATCH_SIZE} registros\n`);

  // Paso 3: importar en lotes
  console.log("🚀 Iniciando importación...\n");
  const startTime = Date.now();

  let totalOk = 0;
  let totalErrors = 0;
  const allErrorDetails: string[] = [];

  for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
    const batch = mapped.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    process.stdout.write(
      `  Importando lote ${batchNum}/${totalBatches} (${i + 1}–${Math.min(i + BATCH_SIZE, mapped.length)})... `
    );

    const result = await importBatch(batch, batchNum, totalBatches);
    totalOk += result.ok;
    totalErrors += result.errors;
    allErrorDetails.push(...result.errorDetails);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const rate = Math.round(totalOk / parseFloat(elapsed));
    console.log(`✓ ${result.ok} OK${result.errors > 0 ? ` / ${result.errors} errores` : ""} [${elapsed}s | ~${rate}/s]`);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  // Paso 4: validación — leer 3 registros de vuelta
  console.log("\n🔍 Validando — leyendo 3 registros de Supabase...\n");
  const { data: sample, error: sampleErr } = await supabase
    .from("properties")
    .select("id, external_id, title, price, currency, country, status, slug")
    .limit(3);

  // Paso 5: reporte final
  console.log("════════════════════════════════════════");
  console.log("  REPORTE FINAL");
  console.log("════════════════════════════════════════");
  console.log(`✅ Importadas correctamente: ${totalOk.toLocaleString()}`);
  console.log(`❌ Con errores:              ${totalErrors.toLocaleString()}`);
  console.log(`⏱️  Tiempo total:             ${totalTime}s`);
  console.log(`📊 Total CSV:                ${allRows.length.toLocaleString()}`);

  if (totalErrors > 0) {
    console.log("\n⚠️  Primeros 5 errores:");
    allErrorDetails.slice(0, 5).forEach((e) => console.log(`   • ${e}`));
  }

  if (sample && !sampleErr) {
    console.log("\n📌 Muestra de 3 registros en Supabase:");
    sample.forEach((p, idx) => {
      console.log(`\n  [${idx + 1}] ${p.title}`);
      console.log(`      ID:      ${p.id}`);
      console.log(`      ExtID:   ${p.external_id}`);
      console.log(`      Precio:  ${p.price ?? "—"} ${p.currency ?? ""}`);
      console.log(`      País:    ${p.country ?? "—"}`);
      console.log(`      Status:  ${p.status}`);
      console.log(`      Slug:    ${p.slug}`);
    });
  }

  console.log("\n════════════════════════════════════════");

  if (totalErrors > 0) process.exit(1);
}

main().catch((err) => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
