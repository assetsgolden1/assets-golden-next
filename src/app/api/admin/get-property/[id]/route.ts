import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { data } = await supabaseAdmin
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  return NextResponse.json({ property: data })
}
