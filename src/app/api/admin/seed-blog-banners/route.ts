import { NextResponse } from 'next/server'
import { assignBannersToPosts } from '@/scripts/assignBlogBanners'
import { requireAdmin } from '@/lib/auth/getUserRole'

export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const result = await assignBannersToPosts()
  return NextResponse.json(result)
}
