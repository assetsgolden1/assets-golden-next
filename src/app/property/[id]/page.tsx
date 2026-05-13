import { permanentRedirect, notFound } from 'next/navigation'
import { createStaticClient } from '@/lib/supabase/queries'

interface PageProps {
  params: Promise<{ id: string }>
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function PropertyRedirect({ params }: PageProps) {
  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    notFound()
  }

  const supabase = createStaticClient()

  const { data, error } = await supabase
    .from('properties')
    .select('slug')
    .eq('id', id)
    .maybeSingle()

  if (error || !data?.slug) {
    notFound()
  }

  permanentRedirect(`/propiedades/${data.slug}`)
}
