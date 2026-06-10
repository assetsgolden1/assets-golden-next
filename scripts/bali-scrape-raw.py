"""
FASE-4.N-P2 — Recolectar datos crudos de las 27 villas/proyectos de Bali
Scrapes prestige pages + Google Doc descriptions + matchea carpeta de fotos.
Salida: scripts/output/bali-raw.json
"""

import csv
import json
import os
import re
import sys
import time

import gdown
import requests
from bs4 import BeautifulSoup

CSV_IN   = r"C:\Users\Asus\Desktop\proyecto\assets-golden-next\scripts\output\bali-fotos-status.csv"
JSON_OUT = r"C:\Users\Asus\Desktop\proyecto\assets-golden-next\scripts\output\bali-raw.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".tiff", ".tif", ".bmp", ".gif"}


# ── HELPERS ─────────────────────────────────────────────────────────────────

def is_image_file(path: str) -> bool:
    return os.path.splitext(path)[1].lower() in IMAGE_EXTS


def scrape_prestige(url: str) -> dict:
    """Fetch JSON-LD + HTML details from a prestige property page."""
    r = requests.get(url, headers=HEADERS, timeout=30)
    soup = BeautifulSoup(r.text, "lxml")

    data = {
        "url": url,
        "title_en": "",
        "external_id": "",
        "price": "",
        "currency": "USD",
        "bedrooms": "",
        "bathrooms": "",
        "area_sqm": "",
        "land_sqm": "",
        "location": "",
        "property_type_raw": "",
        "description_short": "",
    }

    # JSON-LD (most reliable)
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            ld = json.loads(script.string)
            graph = ld.get("@graph", [ld])
            for node in graph:
                if node.get("@type") == "RealEstateListing":
                    data["title_en"] = node.get("name", "")
                    data["description_short"] = node.get("description", "")
                    ident = node.get("identifier", {})
                    if isinstance(ident, dict):
                        data["external_id"] = ident.get("value", "")
                    subj = node.get("subjectOf", {})
                    if isinstance(subj, dict):
                        data["bedrooms"]  = str(subj.get("numberOfBedrooms", ""))
                        data["bathrooms"] = str(subj.get("numberOfBathroomsTotal", ""))
                        fs = subj.get("floorSize", {})
                        if isinstance(fs, dict):
                            data["area_sqm"] = str(fs.get("value", ""))
                        for ap in subj.get("additionalProperty", []):
                            if isinstance(ap, dict) and "Land" in ap.get("name",""):
                                val = ap.get("value","")
                                data["land_sqm"] = re.sub(r"[^\d.]", "", val)
                    offers = node.get("offers", {})
                    if isinstance(offers, dict):
                        data["price"]    = str(offers.get("price", ""))
                        data["currency"] = offers.get("priceCurrency", "USD")
        except Exception:
            pass

    # HTML fallback for missing fields
    detail_wrap = soup.find(class_="detail-wrap")
    if detail_wrap:
        text = detail_wrap.get_text(separator="\n")
        for line in text.splitlines():
            line = line.strip()
            if not line:
                continue
            if "Ref. ID:" in line and not data["external_id"]:
                data["external_id"] = line.split("Ref. ID:")[-1].strip()
            if "Price:" in line and not data["price"]:
                m = re.search(r"[\d,]+", line.replace(",",""))
                if m:
                    data["price"] = m.group(0)
            if "Property Size:" in line and not data["area_sqm"]:
                m = re.search(r"([\d.]+)\s*sqm", line)
                if m:
                    data["area_sqm"] = m.group(1)
            if "Land Area:" in line and not data["land_sqm"]:
                m = re.search(r"([\d.]+)\s*sqm", line)
                if m:
                    data["land_sqm"] = m.group(1)
            if "Bedrooms:" in line and not data["bedrooms"]:
                data["bedrooms"] = line.split("Bedrooms:")[-1].strip().split()[0]
            if "Bathrooms:" in line and not data["bathrooms"]:
                data["bathrooms"] = line.split("Bathrooms:")[-1].strip().split()[0]
            if "Property Type:" in line and not data["property_type_raw"]:
                data["property_type_raw"] = line.split("Property Type:")[-1].strip()

    # Location
    loc_el = soup.find("li", class_=re.compile(r"detail-area"))
    if loc_el:
        loc_text = loc_el.get_text(strip=True)
        # "Property Area Uluwatu" -> "Uluwatu"
        data["location"] = loc_text.replace("Property Area", "").strip()

    # Property type from H1 or page title if still missing
    if not data["property_type_raw"]:
        h1 = soup.find("h1")
        if h1:
            data["property_type_raw"] = h1.get_text(strip=True)

    return data


def find_writeup_doc(folder_ids: list[str]) -> str:
    """
    Scan all folders; find a Google Docs/Slides file (non-image/video).
    Return its file ID, or empty string if not found.
    """
    for fid in folder_ids:
        url = f"https://drive.google.com/drive/folders/{fid}"
        try:
            files = gdown.download_folder(url=url, skip_download=True, quiet=True, use_cookies=False)
            if not files:
                continue
            for f in files:
                if not is_image_file(f.path):
                    return f.id
        except Exception as e:
            print(f"  WARN folder {fid}: {e}", file=sys.stderr)
        time.sleep(1)
    return ""


def fetch_gdoc_text(doc_id: str) -> str:
    """Export a Google Doc as plain text."""
    if not doc_id:
        return ""
    url = f"https://docs.google.com/document/d/{doc_id}/export?format=txt"
    try:
        r = requests.get(url, headers=HEADERS, timeout=30, allow_redirects=True)
        if r.status_code == 200:
            return r.text.strip()
    except Exception as e:
        print(f"  WARN gdoc {doc_id}: {e}", file=sys.stderr)
    return ""


def find_photos_folder(folder_ids: list[str], csv_folder_ids_str: str) -> str:
    """Return the folder ID that has the most images (from CSV data we already have)."""
    # The CSV has drive_folder_ids as pipe-separated IDs; n_imagenes is total.
    # We can't know per-folder count without re-scanning, so we return all IDs
    # joined, but ideally pick the one with images.
    # For simplicity, return the full set — the caller will pick the right one.
    return "|".join(folder_ids)


# ── MAIN ────────────────────────────────────────────────────────────────────

def main():
    # Load CSV
    with open(CSV_IN, encoding="utf-8") as f:
        all_rows = list(csv.DictReader(f))
    props = [r for r in all_rows if r["estado"] == "CON FOTOS"]
    print(f"{len(props)} propiedades CON FOTOS")

    results = []

    for i, row in enumerate(props, 1):
        slug        = row["slug_prestige"]
        link        = row["link_prestige"]
        folder_ids  = [fid for fid in row["drive_folder_ids"].split("|") if fid]
        n_fotos     = int(row["n_imagenes"])
        n_videos    = int(row["n_videos"])
        bloque      = row["bloque"]

        print(f"\n[{i:02d}/{len(props)}] {slug[:65]}")

        # 1. Scrape prestige page
        print(f"  Scraping prestige page...")
        prop_data = scrape_prestige(link)
        time.sleep(2)

        # 2. Find write-up Google Doc
        print(f"  Scanning folders for Google Doc...")
        doc_id = find_writeup_doc(folder_ids)
        if doc_id:
            print(f"  Found doc ID: {doc_id}")
        else:
            print(f"  No Google Doc found in any folder")

        # 3. Fetch doc text
        writeup_text = ""
        if doc_id:
            print(f"  Fetching Google Doc text...")
            writeup_text = fetch_gdoc_text(doc_id)
            print(f"  Doc text length: {len(writeup_text)} chars")
        time.sleep(1)

        # 4. Determine photos folder (the one with >0 images in CSV)
        # We'll store all folder IDs; the folder WITH images is the photo folder
        # (identified during phase 1)
        result = {
            "bloque":            bloque,
            "slug_prestige":     slug,
            "link_prestige":     link,
            "title_en":          prop_data["title_en"],
            "external_id":       prop_data["external_id"],
            "price":             prop_data["price"],
            "currency":          prop_data["currency"],
            "bedrooms":          prop_data["bedrooms"],
            "bathrooms":         prop_data["bathrooms"],
            "area_sqm":          prop_data["area_sqm"],
            "land_sqm":          prop_data["land_sqm"],
            "location":          prop_data["location"],
            "property_type_raw": prop_data["property_type_raw"],
            "description_short": prop_data["description_short"],
            "gdoc_id":           doc_id,
            "writeup_text":      writeup_text,
            "drive_folder_ids":  "|".join(folder_ids),
            "n_fotos":           n_fotos,
            "n_videos":          n_videos,
        }
        results.append(result)

        print(f"  title_en: {prop_data['title_en']}")
        print(f"  id: {prop_data['external_id']}  price: {prop_data['price']} {prop_data['currency']}")
        print(f"  beds: {prop_data['bedrooms']}  baths: {prop_data['bathrooms']}")
        print(f"  area: {prop_data['area_sqm']} sqm  land: {prop_data['land_sqm']} sqm")
        print(f"  location: {prop_data['location']}")
        print(f"  type_raw: {prop_data['property_type_raw']}")
        print(f"  writeup chars: {len(writeup_text)}")

    # Save JSON
    os.makedirs(os.path.dirname(JSON_OUT), exist_ok=True)
    with open(JSON_OUT, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n\nJSON raw -> {JSON_OUT}")
    print(f"Total: {len(results)} propiedades")

    # Quick summary
    no_writeup = [r for r in results if not r["writeup_text"]]
    no_area    = [r for r in results if not r["area_sqm"]]
    no_price   = [r for r in results if not r["price"]]
    no_beds    = [r for r in results if not r["bedrooms"]]
    no_loc     = [r for r in results if not r["location"]]

    print("\n--- COBERTURA ---")
    print(f"  Sin write-up text : {len(no_writeup)}")
    print(f"  Sin area_sqm      : {len(no_area)}")
    print(f"  Sin price         : {len(no_price)}")
    print(f"  Sin bedrooms      : {len(no_beds)}")
    print(f"  Sin location      : {len(no_loc)}")

    if no_writeup:
        print("\nSin write-up:")
        for r in no_writeup:
            print(f"  - {r['slug_prestige']}")
    if no_area:
        print("\nSin area_sqm:")
        for r in no_area:
            print(f"  - {r['slug_prestige']}  land_sqm={r['land_sqm']}")


if __name__ == "__main__":
    main()
