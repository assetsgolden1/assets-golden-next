import { redirect, notFound } from 'next/navigation'
import { ZONE_SLUGS } from '@/lib/constants/spainZones'

interface Props {
  params: Promise<{ slug: string; ciudad: string }>
}

export const dynamicParams = true
export const revalidate = 86400

export default async function ZonaCiudadPage({ params }: Props) {
  const { slug, ciudad } = await params

  if (slug in ZONE_SLUGS) {
    redirect(`/destinos/espana?zona=${slug}&ciudad=${encodeURIComponent(ciudad)}`)
  }

  notFound()
}
