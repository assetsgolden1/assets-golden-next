import os
base = r"C:\Users\Asus\Downloads\fotos"
print("BASE:", base, "| existe:", os.path.isdir(base))
IMG = ('.jpg','.jpeg','.png','.heic','.heif','.webp','.gif','.bmp','.tiff')
for root, dirs, files in os.walk(base):
    rel = os.path.relpath(root, base)
    exts = {}
    for f in files:
        e = os.path.splitext(f)[1].lower()
        exts[e] = exts.get(e, 0) + 1
    imgs = [f for f in files if f.lower().endswith(IMG)]
    print("")
    print("[" + rel + "]  total=" + str(len(files)) + "  imagenes=" + str(len(imgs)))
    print("  extensiones:", exts)
    for f in sorted(files)[:6]:
        print("   -", f)
