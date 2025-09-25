import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/lib/s3'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ success: false, error: 'file is required' }, { status: 400 })

    if (!file.type?.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Only images allowed' }, { status: 400 })
    }
    const maxBytes = 5 * 1024 * 1024
    if (file.size > maxBytes) {
      return NextResponse.json({ success: false, error: 'Max size 5MB' }, { status: 400 })
    }

    const bucket = process.env.SUPABASE_BUCKET as string
    if (!bucket) {
      return NextResponse.json({ success: false, error: 'Bucket is not configured' }, { status: 500 })
    }

    const ext = (file.name?.split('.').pop() || 'bin').toLowerCase()
    const key = `${new Date().toISOString().slice(0,10)}/${randomUUID()}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    }))

    const publicBase = process.env.SUPABASE_STORAGE_PUBLIC_URL as string
    if (!publicBase) {
      return NextResponse.json({ success: false, error: 'Public URL base not configured' }, { status: 500 })
    }
    const url = `${publicBase}/${bucket}/${encodeURI(key)}`

    return NextResponse.json({ success: true, url, key }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Upload failed' }, { status: 500 })
  }
}


