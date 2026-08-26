import { Link } from '@/i18n/navigation'

interface PaginationBarProps {
  currentPage: number
  totalPages: number
  basePath: string
  currentParams?: Record<string, string | undefined>
  locale?: string
}

export function PaginationBar({
  currentPage,
  totalPages,
  basePath,
  currentParams = {},
  locale = 'es',
}: PaginationBarProps) {
  const en = locale === 'en'
  function buildUrl(page: number) {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(currentParams)) {
      if (v) params.set(k, v)
    }
    if (page > 1) params.set('page', String(page))
    const qs = params.toString()
    return `${basePath}${qs ? `?${qs}` : ''}`
  }

  const start = Math.max(1, currentPage - 2)
  const end   = Math.min(totalPages, start + 4)
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 40,
      paddingTop: 24,
      borderTop: '1px solid #e5e7eb',
      flexWrap: 'wrap',
    }}>
      {currentPage > 1 && (
        <Link href={buildUrl(currentPage - 1)} style={linkStyle(false)}>
          ← {en ? 'Previous' : 'Anterior'}
        </Link>
      )}

      {start > 1 && (
        <>
          <Link href={buildUrl(1)} style={linkStyle(false)}>1</Link>
          {start > 2 && <span style={{ color: '#9ca3af', fontSize: 13 }}>…</span>}
        </>
      )}

      {pages.map(p => (
        <Link key={p} href={buildUrl(p)} style={linkStyle(p === currentPage)}>
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ color: '#9ca3af', fontSize: 13 }}>…</span>}
          <Link href={buildUrl(totalPages)} style={linkStyle(false)}>{totalPages}</Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link href={buildUrl(currentPage + 1)} style={linkStyle(false)}>
          {en ? 'Next' : 'Siguiente'} →
        </Link>
      )}
    </div>
  )
}

function linkStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 14px',
    borderRadius: 6,
    border: '1px solid',
    fontSize: 13,
    textDecoration: 'none',
    backgroundColor: active ? '#131D2E' : 'white',
    color: active ? 'white' : '#374151',
    borderColor: active ? '#131D2E' : '#e5e7eb',
    fontWeight: active ? 600 : 400,
  }
}
