import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PortalPropertyDetail } from '@/components/portal/PortalPropertyDetail'
import type { Property } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PortalPropertyPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!property) notFound()

  return <PortalPropertyDetail property={property as Property} />
}
