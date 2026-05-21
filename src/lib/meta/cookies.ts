// Extrae las cookies _fbp y _fbc del request para el CAPI matching
export function getMetaCookies(request: Request): { fbp?: string; fbc?: string } {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const cookies: Record<string, string> = {}

  cookieHeader.split(';').forEach((part) => {
    const [key, ...rest] = part.trim().split('=')
    if (key) cookies[key.trim()] = rest.join('=').trim()
  })

  return {
    fbp: cookies['_fbp'],
    fbc: cookies['_fbc'],
  }
}
