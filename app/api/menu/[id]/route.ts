import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id: menuId } = await params
    const body = await request.json()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, updated_at, ...updateData } = body

    const { data, error } = await supabase
      .from("menu_items")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", menuId)
      .select()
      .single()

    if (error) {
      console.error("Supabase error updating menu item:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("Error updating menu item:", error)
    return NextResponse.json({ error: error.message || "Failed to update menu item" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id: menuId } = await params

    const { error } = await supabase.from("menu_items").delete().eq("id", menuId)

    if (error) {
      console.error("Supabase error deleting menu item:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json({ error: error.message || "Failed to delete menu item" }, { status: 500 })
  }
}
