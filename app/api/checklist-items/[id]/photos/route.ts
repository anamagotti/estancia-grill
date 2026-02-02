import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

type Props = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("checklist_item_photos")
      .select("*")
      .eq("checklist_item_id", id)
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[v0] Error fetching photos:", error)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const photosInput = body.photos || (body.photo ? [{ url: body.photo, type: body.type }] : [])
    if (!photosInput || photosInput.length === 0) {
      return NextResponse.json({ error: "Nenhuma foto enviada" }, { status: 400 })
    }

    // Suporta itens como string ou objeto { url, type }
    const payload = photosInput.map((p: any) => ({
      checklist_item_id: id,
      photo_url: typeof p === "string" ? p : p.url,
      photo_type: typeof p === "string" ? null : p.type ?? null,
    }))

    // Tenta inserir com photo_type; se falhar por coluna ausente, faz fallback sem photo_type
    const { data, error } = await supabase.from("checklist_item_photos").insert(payload).select()
    if (error) {
      const payloadNoType = payload.map(({ checklist_item_id, photo_url }) => ({ checklist_item_id, photo_url }))
      const { data: dataFallback, error: errorFallback } = await supabase
        .from("checklist_item_photos")
        .insert(payloadNoType)
        .select()
      if (errorFallback) throw errorFallback
      return NextResponse.json({ data: dataFallback })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[v0] Error inserting photos:", error)
    return NextResponse.json({ error: "Failed to insert photos" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const photoId: string = body.photoId
    const photoIds: string[] = body.photoIds

    if (!photoId && (!photoIds || photoIds.length === 0)) {
      return NextResponse.json({ error: "photoId ou photoIds obrigatório" }, { status: 400 })
    }

    const query = supabase.from("checklist_item_photos").delete()
    let result
    if (photoId) {
      const { error } = await query.eq("id", photoId)
      if (error) throw error
      result = { success: true, deleted: 1 }
    } else {
      const { error } = await query.in("id", photoIds)
      if (error) throw error
      result = { success: true }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error deleting photo:", error)
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 })
  }
}
