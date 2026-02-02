import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { items } = await request.json()

    const itemsToInsert = items.map((item: any) => ({
      inspection_id: item.inspection_id,
      category: item.category,
      item_name: item.item_name,
      status: item.status,
      points: item.points,
      observation: item.observation,
      responsible: item.responsible,
      photo_url: item.photo_url,
    }))

    const { data, error } = await supabase.from("checklist_items").insert(itemsToInsert).select()

    if (error) {
      console.error("Supabase error creating checklist items:", error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    // Inserir fotos múltiplas se houver (suporta arrays de string ou objetos { url, type })
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const insertedItem = data[i]

      if (item.photos && item.photos.length > 0) {
        const photosPayload = item.photos.map((p: any) => {
          const isString = typeof p === "string"
          return {
            checklist_item_id: insertedItem.id,
            photo_url: isString ? p : p.url,
            photo_type: isString ? null : p.type ?? null,
          }
        })

        // Tenta inserir com photo_type; se falhar, tenta sem photo_type
        const { error: photoError } = await supabase.from("checklist_item_photos").insert(photosPayload)
        if (photoError) {
          const payloadNoType = photosPayload.map(({ checklist_item_id, photo_url }) => ({ checklist_item_id, photo_url }))
          const { error: photoErrorFallback } = await supabase.from("checklist_item_photos").insert(payloadNoType)
          if (photoErrorFallback) {
            console.error("[v0] Error inserting photos (fallback):", photoErrorFallback)
          }
        }
      }
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[v0] Error creating checklist items:", error)
    return NextResponse.json({ error: error.message || "Failed to create checklist items" }, { status: 500 })
  }
}
