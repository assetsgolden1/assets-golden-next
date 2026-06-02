export function buildAlternates(path: string) {
  const enPath = path === '/' ? '/en' : `/en${path}`
  return {
    canonical: path,
    languages: {
      es: path,
      en: enPath,
      'x-default': path,
    },
  }
}
