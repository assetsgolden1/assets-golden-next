"""
FASE-4.N-P7.2 — Convertir .HEIC -> .jpg para PV924
Preserva orden de numeracion, orientacion EXIF, calidad 90.
Deja los .jpg junto a los originales (no borra HEIC).
"""

import os
import sys
from pathlib import Path

try:
    import pillow_heif
    from PIL import Image, ImageOps
    pillow_heif.register_heif_opener()
except ImportError as e:
    print(f"ERROR: {e}")
    print("Instalar con: pip install pillow-heif")
    sys.exit(1)

FOLDER = Path(r"C:\Users\Asus\Desktop\proyecto\assets-golden-next\scripts\output\bali-fotos\PV924_ubud-riverside-haven-2-bedroom-leasehold-villas")

heic_files = sorted(f for f in FOLDER.iterdir() if f.suffix.upper() == ".HEIC")
print(f"Encontrados {len(heic_files)} archivos HEIC:")

converted = []
for heic_path in heic_files:
    jpg_name = heic_path.stem + ".jpg"
    jpg_path = FOLDER / jpg_name
    print(f"  {heic_path.name} -> {jpg_name} ... ", end="", flush=True)

    img = Image.open(heic_path)
    # Aplicar orientacion EXIF antes de guardar
    img = ImageOps.exif_transpose(img)
    # Convertir a RGB si es necesario (HEIC puede traer RGBA o P)
    if img.mode in ("RGBA", "P", "LA"):
        img = img.convert("RGB")
    elif img.mode != "RGB":
        img = img.convert("RGB")

    img.save(jpg_path, format="JPEG", quality=90, optimize=True)
    size_kb = jpg_path.stat().st_size // 1024
    print(f"OK ({size_kb} KB)")
    converted.append(jpg_path.name)

print(f"\nConvertidos: {len(converted)}")

# Listar todo el contenido final de la carpeta (fotos validas)
valid_ext = {".jpg", ".jpeg", ".png", ".webp"}
all_photos = sorted(f for f in FOLDER.iterdir() if f.suffix.lower() in valid_ext)
print(f"\nFotos listas para subir ({len(all_photos)}):")
for p in all_photos:
    print(f"  {p.name}")
