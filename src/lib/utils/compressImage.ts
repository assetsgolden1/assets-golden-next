import imageCompression from 'browser-image-compression'

/**
 * Comprime y redimensiona una imagen EN EL NAVEGADOR antes de subirla.
 * - Si el archivo no es imagen, lo devuelve tal cual.
 * - Si la compresión falla, hace console.warn y devuelve el archivo original
 *   (no rompe el flujo de subida).
 * - Preserva el nombre original del archivo.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: 4.5,
      maxWidthOrHeight: 2560,
      useWebWorker: true,
      initialQuality: 0.8,
    })

    // Preservar el nombre original (la librería puede devolver un Blob/File sin name).
    if (compressed.name === file.name) return compressed
    return new File([compressed], file.name, {
      type: compressed.type || file.type,
      lastModified: file.lastModified,
    })
  } catch (err) {
    console.warn('[compressImage] compresión falló, se sube el original:', err)
    return file
  }
}
