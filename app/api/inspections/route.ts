import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Garantir que existe um registro em public.users para o inspector
    const { data: authUser } = await supabase.auth.getUser()
    const inspectorId: string | undefined = body.inspector_id
    if (authUser?.user && inspectorId === authUser.user.id) {
      const { data: existing } = await supabase.from("users").select("id").eq("id", inspectorId).single()
      if (!existing) {
        // Tentar criar o usuário mínimo obedecendo RLS (auth.uid() = id)
        await supabase
          .from("users")
          .insert({ id: inspectorId, email: authUser.user.email || "", full_name: authUser.user.user_metadata?.full_name || null })
      }
    }

    // Garantir franchise_id válido: se vier vazio/indefinido, buscar ou criar Estância Grill — Bauru
    if (!body.franchise_id || typeof body.franchise_id !== "string" || body.franchise_id.trim() === "") {
      // Tentar encontrar
      const { data: foundFr } = await supabase
        .from("franchises")
        .select("id")
        .eq("name", "Estância Grill")
        .eq("location", "Bauru")
        .limit(1)
      let franchiseId: string | undefined = foundFr && foundFr.length > 0 ? foundFr[0].id : undefined

      // Se não existir, criar
      if (!franchiseId) {
        const { data: createdFr, error: createFrError } = await supabase
          .from("franchises")
          .insert({ name: "Estância Grill", location: "Bauru" })
          .select("id")
          .single()
        if (createFrError) {
          console.error("Supabase error creating default franchise:", createFrError)
          return NextResponse.json({ error: createFrError.message }, { status: 500 })
        }
        franchiseId = createdFr.id
      }

      body.franchise_id = franchiseId
    }

    const { data, error } = await supabase.from("inspections").insert([body]).select().single()

    if (error) {
      console.error("Supabase error creating inspection:", error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[v0] Error creating inspection:", error)
    return NextResponse.json({ error: error.message || "Failed to create inspection" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("inspections")
      .select("*, franchises(name, location)")
      .order("inspection_date", { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[v0] Error fetching inspections:", error)
    return NextResponse.json({ error: "Failed to fetch inspections" }, { status: 500 })
  }
}
