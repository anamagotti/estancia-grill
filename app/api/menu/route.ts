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
