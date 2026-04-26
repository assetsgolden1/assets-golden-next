import { NextResponse } from 'next/server'
import { assignBannersToPosts } from '@/scripts/assignBlogBanners'

export async function GET() {
  const result = await assignBannersToPosts()
  return NextResponse.json(result)
}
