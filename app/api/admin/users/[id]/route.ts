import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth-utils"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { role } = body

    const supabase = await createServerClient()

    const { error } = await supabase.from("profiles").update({ role }).eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: "Erro ao atualizar função" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const supabase = await createServerClient()

    // Deletar usuário do Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(params.id)

    if (error) {
      return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }
}
