import { NextRequest, NextResponse } from 'next/server'
import { assignBannersToPosts } from '@/scripts/assignBlogBanners'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { checkRateLimit, mutationRateLimit, getIdentifier } from '@/lib/ratelimit'

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

  const result = await assignBannersToPosts()
  return NextResponse.json(result)
}
