export function toSentenceCase(str: string): string {
  if (!str) return ''
  const letters = str.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]/g, '')
  const upperCount = (str.match(/[A-ZÁÉÍÓÚÜÑ]/g) ?? []).length
  const isAllCaps = letters.length > 0 && upperCount / letters.length > 0.7
  if (!isAllCaps) return str
  return str
    .toLowerCase()
    .replace(/(^|\.\s+|:\s+)([a-záéíóúüñ])/g, (_, prefix, letter) => prefix + letter.toUpperCase())
    .replace(/^[a-záéíóúüñ]/, (letter) => letter.toUpperCase())
}
