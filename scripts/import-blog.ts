/**
 * Script: import-blog.ts
 * Importa blog posts desde CSV → Supabase tabla blog_posts
 * Uso: npx tsx scripts/import-blog.ts
 */

import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
}
loadEnvLocal();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const CSV_PATH = path.resolve(
  "C:/Users/Asus/Desktop/proyecto/assets-golden/web/Lovable data/blog_posts-export-2026-04-09_22-24-49.csv"
);

const slugCounters = new Map<string, number>();
function generateSlug(title: string): string {
  const base = (title || "post")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim()
    .replace(/\s+/g, "-").slice(0, 80);
  const count = slugCounters.get(base) ?? 0;
  slugCounters.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

interface CsvRow {
  id: string; title: string; title_en: string;
  excerpt: string; excerpt_en: string; content: string; content_en: string;
  image_url: string; read_time: string; published: string;
  created_at: string; updated_at: string; category: string; video_url: string;
}

function mapRow(row: CsvRow) {
  const isPublished = row.published?.toLowerCase() === "true";
  return {
    id:            row.id || undefined,
    title:         row.title?.trim() || "Sin título",
    title_en:      row.title_en || null,
    slug:          generateSlug(row.title),
    excerpt:       row.excerpt || null,
    excerpt_en:    row.excerpt_en || null,
    content:       row.content || null,
    content_en:    row.content_en || null,
    cover_image:   row.image_url || null,
    category:      row.category || null,
    published:     isPublished,
    published_at:  isPublished ? (row.updated_at || row.created_at || null) : null,
    created_at:    row.created_at || new Date().toISOString(),
    updated_at:    row.updated_at || new Date().toISOString(),
  };
}

async function main() {
  console.log("════════════════════════════════════════");
  console.log("  Assets Golden — Importación Blog Posts");
  console.log("════════════════════════════════════════\n");

  const rows: CsvRow[] = await new Promise((resolve, reject) => {
    const acc: CsvRow[] = [];
    fs.createReadStream(CSV_PATH, { encoding: "utf-8" })
      .pipe(parse({ delimiter: ";", columns: true, skip_empty_lines: true, relax_quotes: true }))
      .on("data", (r: CsvRow) => acc.push(r))
      .on("error", reject)
      .on("end", () => resolve(acc));
  });

  console.log(`📖 CSV leído: ${rows.length} posts\n`);
  const mapped = rows.map(mapRow);

  const { error } = await supabase
    .from("blog_posts")
    .upsert(mapped, { onConflict: "id", ignoreDuplicates: false });

  if (error) {
    console.error("❌ Error en upsert:", error.message);
    let ok = 0, errors = 0;
    for (const row of mapped) {
      const { error: e } = await supabase.from("blog_posts").upsert(row, { onConflict: "id" });
      if (e) { errors++; console.error(`  ❌ ${row.title}: ${e.message}`); }
      else ok++;
    }
    console.log(`\n✅ OK: ${ok} | ❌ Errores: ${errors}`);
  } else {
    console.log(`✅ ${rows.length} posts importados correctamente`);
  }

  const { data: sample } = await supabase
    .from("blog_posts")
    .select("title, slug, published, category, created_at")
    .order("created_at");

  if (sample) {
    console.log("\n📌 Blog posts importados:");
    sample.forEach(p =>
      console.log(`  ${p.published ? "✅" : "📝"} [${p.category}] ${p.title}\n     slug: ${p.slug}`)
    );
  }
  console.log("\n════════════════════════════════════════");
}

main().catch(err => { console.error("❌ Fatal:", err); process.exit(1); });
