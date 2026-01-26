import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const email = (body?.email || "").toString().trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: "Informe um e-mail válido" }, { status: 400 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Verifica se já existe algum admin
    const { count: adminCount } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .in("role", ["admin", "adm", "administrator", "administrador"]) as unknown as { count: number }

    const requesterIsAdmin = await isAdmin()

    if ((adminCount || 0) > 0 && !requesterIsAdmin) {
      return NextResponse.json({ error: "Apenas admin pode promover após o primeiro admin criado" }, { status: 403 })
    }

    const { data: userRow } = await supabase.from("users").select("*").eq("email", email).single()
    if (!userRow) {
      return NextResponse.json({ error: "Usuário não encontrado com esse e-mail" }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("users")
      .update({ role: "administrador" })
      .eq("email", email)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Falha ao promover usuário" }, { status: 500 })
  }
}
