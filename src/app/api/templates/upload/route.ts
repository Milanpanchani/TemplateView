import { NextRequest, NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3 } from "@/lib/s3"
import { randomUUID } from "crypto"

type DecodedToken = { userId: string; role: "ADMIN" | "USER"; exp?: number }

function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payload = parts[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp && decoded.exp < now) return null
    return decoded as DecodedToken
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    // Ensure only ADMIN can upload resource files
    const token = req.cookies.get("token")?.value
    const decoded = token ? decodeToken(token) : null
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const form = await req.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ success: false, error: "file is required" }, { status: 400 })

    // Limit size (100MB)
    const maxBytes = 100 * 1024 * 1024
    if (file.size > maxBytes) {
      return NextResponse.json({ success: false, error: "Max size 100MB" }, { status: 400 })
    }
    // No auto-zip. Upload as-is.

    const bucket = process.env.SUPABASE_BUCKET as string
    if (!bucket) {
      return NextResponse.json({ success: false, error: "Bucket is not configured" }, { status: 500 })
    }

    const ext = (file.name?.split('.').pop() || 'bin').toLowerCase()
    const key = `resources/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    }))

    // Construct a public URL for Supabase public buckets
    // Prefer explicit base, otherwise fall back to `${SUPABASE_URL}/storage/v1/object/public`
    const explicitBase = process.env.SUPABASE_STORAGE_PUBLIC_URL as string | undefined
    const supabaseUrl = process.env.SUPABASE_URL as string | undefined
    const fallbackBase = supabaseUrl ? `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public` : undefined
    const base = explicitBase || fallbackBase
    const url = base ? `${base}/${bucket}/${encodeURI(key)}` : undefined

    return NextResponse.json({ success: true, key, url }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Upload failed" }, { status: 500 })
  }
}


