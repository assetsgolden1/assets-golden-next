import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { checkRateLimit, mutationRateLimit, getIdentifier } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const rateLimitCheck = await checkRateLimit(
    mutationRateLimit,
    getIdentifier(request)
  )
  if (!rateLimitCheck.ok) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: rateLimitCheck.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rateLimitCheck.retryAfter) } }
    )
  }

  try {
    // Dynamic import prevents puppeteer from being bundled at build time
    const { runScraper } = await import('@/scripts/scrapeOriginalWeb')
    const result = await runScraper()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
