import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log('[upload] service key exists:', !!serviceKey)
    console.log('[upload] service key length:', serviceKey?.length)

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = (formData.get('bucket') as string) ?? 'property-images'

    console.log('[upload-image] bucket:', bucket)
    console.log('[upload-image] file:', file?.name, file?.size, file?.type)

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const folder = bucket === 'destination-images' ? '' : 'properties/'
    const fileName = `${folder}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    console.log('[upload-image] uploading as:', fileName)

    const buffer = Buffer.from(await file.arrayBuffer())

    console.log('[upload-image] buffer size:', buffer.length)

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, { contentType: file.type, upsert: true })

    console.log('[upload-image] upload result:', { uploadData, uploadError })

    if (uploadError) {
      console.error('[upload-image] error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName)

    console.log('[upload-image] public URL:', urlData.publicUrl)

    return NextResponse.json({ url: urlData.publicUrl })

  } catch (err) {
    console.error('[upload-image] exception:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
