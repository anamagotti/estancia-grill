import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { items } = await request.json()

    // Validação básica: inspection_id deve ser UUID em todos os itens
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    for (const it of items) {
      if (!it.inspection_id || typeof it.inspection_id !== "string" || !uuidRegex.test(it.inspection_id)) {
        return NextResponse.json({ error: "inspection_id inválido ao salvar itens" }, { status: 400 })
      }
    }

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
        // Garantir que o id do item inserido é UUID válido
        if (!insertedItem?.id || !uuidRegex.test(insertedItem.id)) {
          console.error("[v0] Invalid checklist item id, skipping photos:", insertedItem?.id)
          continue
        }

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
