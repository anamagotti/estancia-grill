import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log("Creating menu item(s):", body)

    // Handle both array (bulk) and object (single)
    const payload = Array.isArray(body) ? body : [body];

    const { data, error } = await supabase.from("menu_items").insert(payload).select()

    if (error) {
      console.error("Supabase error creating menu item:", error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("Error creating menu item:", error)
    return NextResponse.json({ error: error.message || "Failed to create menu item" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { pathname } = new URL(request.url)
    // Se o path terminar com /api/menu (sem ID), e tiver query params, é delete em massa
    // Mas Next.js app router passa ID como param na rota dinâmica [id].
    // Aqui estamos em route.ts raiz de /api/menu, então só pegamos query params.
    
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
         return NextResponse.json({ error: "Date or ID required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Delete all items for this date
    const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("date", date)

    if (error) throw error

    return NextResponse.json({ message: "Menu cleared for date" })

  } catch (error: any) {
    console.error("Error deleting menu items:", error)
    return NextResponse.json({ error: error.message || "Failed to delete menu items" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    const supabase = await createClient()

    let query = supabase.from("menu_items").select("*").order("created_at", { ascending: true })

    if (date) {
      query = query.eq("date", date)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 })
  }
}

