import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    // Garantir que existe um registro em public.users para o inspector
    const { data: authUser } = await supabase.auth.getUser()
    const authInspectorId = authUser?.user?.id

    // Forçar o inspector_id vindo da sessão autenticada quando disponível
    if (authInspectorId) {
      body.inspector_id = authInspectorId
      const { data: existing } = await supabase.from("users").select("id").eq("id", authInspectorId).single()
      if (!existing) {
        await supabase
          .from("users")
          .insert({ id: authInspectorId, email: authUser?.user?.email || "", full_name: authUser?.user?.user_metadata?.full_name || null })
      }
    } else if (typeof body.inspector_id === "string") {
      // Sanitiza caso venha do cliente
      body.inspector_id = body.inspector_id.trim()
    }

    // Validação básica do inspector_id (quando presente)
    if (!body.inspector_id || typeof body.inspector_id !== "string" || !uuidRegex.test(body.inspector_id)) {
      console.error("[api/inspections] inspector_id inválido:", body.inspector_id)
      return NextResponse.json({ error: "Inspector inválido ou não autenticado" }, { status: 400 })
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

    // Sanitizar/validar a data da vistoria
    let dateStr: string | undefined = body.inspection_date
    if (typeof dateStr !== "string" || dateStr.trim() === "") {
      dateStr = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    }
    // Alguns navegadores móveis podem enviar em outro formato; tenta normalizar
    try {
      const d = new Date(dateStr)
      // Se inválido, força hoje
      if (isNaN(d.getTime())) {
        dateStr = new Date().toISOString().slice(0, 10)
      } else {
        // Normaliza para YYYY-MM-DD
        dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
      }
    } catch (_) {
      dateStr = new Date().toISOString().slice(0, 10)
    }
    body.inspection_date = dateStr

    const { data, error } = await supabase.from("inspections").insert([body]).select().single()

    if (error) {
      console.error("Supabase error creating inspection:", error, "payload:", body)
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
