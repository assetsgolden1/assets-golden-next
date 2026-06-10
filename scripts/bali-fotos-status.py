"""
FASE-4.N-P1 — Clasificar villas/proyectos de Bali por estado de fotos en Drive
Usa gdown skip_download=True para listar archivos sin descargar.
"""

import csv
import os
import re
import sys
import time

from docx import Document
import gdown

# ── CONFIG ──────────────────────────────────────────────────────────────────
DOCX_PATH  = r"C:\Users\Asus\Downloads\Co-broking Bali Spain .docx"
OUTPUT_CSV = r"C:\Users\Asus\Desktop\proyecto\assets-golden-next\scripts\output\bali-fotos-status.csv"

EXCLUDED_SLUGS = {
    "modern-architectural-masterpiece-in-uluwatu",
    "modern-3-bedroom-brand-new-villa-with-rice-field-views-canggu-bali-2",
    "turnkey-3-bedroom-income-generator-freehold-villa-in-ungasan",
    "last-unit-high-yield-2-bedroom-villa-in-ubud",
    "luxury-modern-estate-in-tumbakbayuh-33-year-leasehold",
    "2br-mediterranean-jungle-villa-with-double-private-pool-concept",
    "river-front-villa-project-in-umalas-a-blend-of-mediterranean-and-tropical-elegance",
    "luxury-2-bedroom-leasehold-villa-in-umalas-with-private-pool-home-office-ready",
}

LAND_KEYWORDS = ["Freehold Lands", "Leasehold Lands"]

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".tiff", ".tif", ".bmp", ".gif"}
VIDEO_EXTS = {".mp4", ".mov", ".avi", ".mkv", ".m4v", ".wmv", ".flv", ".webm", ".mpg", ".mpeg"}


# ── DOCX PARSER ─────────────────────────────────────────────────────────────
def parse_docx(path: str) -> list[dict]:
    doc = Document(path)
    properties = []
    current_block = None
    in_land_block = False
    current_prop = None

    PRESTIGE_PREFIX = "https://prestigepropertybali.com/property/"
    DRIVE_PREFIX    = "https://drive.google.com"

    def flush_prop():
        nonlocal current_prop
        if current_prop is None:
            return
        slug = current_prop["slug"]
        if slug not in EXCLUDED_SLUGS and not in_land_block:
            properties.append(dict(current_prop))
        current_prop = None

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue

        is_land = any(kw in text for kw in LAND_KEYWORDS)
        is_block_header = (
            text.startswith(("Freehold", "Leasehold", "Development"))
            and not text.startswith("https://")
        )

        if is_block_header:
            flush_prop()
            in_land_block = is_land
            current_block = text
            continue

        if in_land_block:
            continue

        if PRESTIGE_PREFIX in text:
            flush_prop()
            m = re.search(r"https://prestigepropertybali\.com/property/([^\s,?]+)", text)
            if m:
                current_prop = {
                    "bloque": current_block or "",
                    "link_prestige": m.group(0),
                    "slug": m.group(1),
                    "drive_urls": [],
                }
            continue

        if DRIVE_PREFIX in text and current_prop is not None:
            for m in re.finditer(r"https://drive\.google\.com/drive/folders/([A-Za-z0-9_-]+)", text):
                fid = m.group(1)
                url = f"https://drive.google.com/drive/folders/{fid}"
                if url not in current_prop["drive_urls"]:
                    current_prop["drive_urls"].append(url)

    flush_prop()
    return properties


# ── DRIVE LISTING ────────────────────────────────────────────────────────────
def classify_file(filename: str) -> str:
    """Return 'image', 'video', or 'other' based on extension."""
    ext = os.path.splitext(filename)[1].lower()
    if ext in IMAGE_EXTS:
        return "image"
    if ext in VIDEO_EXTS:
        return "video"
    return "other"


def count_folder(folder_url: str) -> tuple[int, int]:
    """Return (n_images, n_videos) for a Drive folder using gdown skip_download."""
    try:
        files = gdown.download_folder(
            url=folder_url,
            skip_download=True,
            quiet=True,
            use_cookies=False,
        )
        if not files:
            return 0, 0
        n_images = sum(1 for f in files if classify_file(f.path) == "image")
        n_videos = sum(1 for f in files if classify_file(f.path) == "video")
        return n_images, n_videos
    except Exception as e:
        print(f"      WARN {folder_url}: {e}", file=sys.stderr)
        return 0, 0


# ── MAIN ────────────────────────────────────────────────────────────────────
def main():
    print("Parseando docx…")
    props = parse_docx(DOCX_PATH)
    print(f"  {len(props)} propiedades a procesar")

    rows = []
    for i, prop in enumerate(props, 1):
        slug = prop["slug"]
        drive_urls = prop["drive_urls"]
        folder_ids = [
            re.search(r"/folders/([A-Za-z0-9_-]+)", u).group(1)
            for u in drive_urls
            if re.search(r"/folders/([A-Za-z0-9_-]+)", u)
        ]

        print(f"\n[{i:02d}/{len(props)}] {slug[:65]}")
        print(f"  {len(drive_urls)} carpeta(s) Drive")

        total_imgs = 0
        total_vids = 0

        for url in drive_urls:
            n_i, n_v = count_folder(url)
            print(f"  >> {url[-30:]}  imgs={n_i}  vids={n_v}")
            total_imgs += n_i
            total_vids += n_v
            time.sleep(1.5)  # pausa cortes entre carpetas

        if total_imgs > 0:
            estado = "CON FOTOS"
        elif total_vids > 0:
            estado = "SOLO VIDEO"
        else:
            estado = "VACÍA"

        print(f"  TOTAL imgs={total_imgs} vids={total_vids}  → {estado}")

        rows.append({
            "bloque":          prop["bloque"],
            "slug_prestige":   slug,
            "link_prestige":   prop["link_prestige"],
            "drive_folder_ids": "|".join(folder_ids),
            "n_imagenes":      total_imgs,
            "n_videos":        total_vids,
            "estado":          estado,
        })

    # CSV
    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)
    fieldnames = ["bloque","slug_prestige","link_prestige","drive_folder_ids","n_imagenes","n_videos","estado"]
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n\nCSV → {OUTPUT_CSV}")

    con_fotos  = [r for r in rows if r["estado"] == "CON FOTOS"]
    solo_video = [r for r in rows if r["estado"] == "SOLO VIDEO"]
    vacias     = [r for r in rows if r["estado"] == "VACÍA"]

    print("\n" + "="*65)
    print(f"RESUMEN — {len(rows)} villas/proyectos procesados")
    print(f"  CON FOTOS  : {len(con_fotos)}")
    print(f"  SOLO VIDEO : {len(solo_video)}")
    print(f"  VACÍAS     : {len(vacias)}")

    if vacias:
        print("\nVACÍAS (sin fotos ni videos):")
        for r in vacias:
            print(f"  - [{r['bloque']}]  {r['slug_prestige']}")

    if solo_video:
        print("\nSOLO VIDEO (sin fotos):")
        for r in solo_video:
            print(f"  - [{r['bloque']}]  {r['slug_prestige']}")
    print("="*65)


if __name__ == "__main__":
    main()
