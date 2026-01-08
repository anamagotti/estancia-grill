import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import InspectionEditForm from "@/components/inspection-edit-form"
import { requireAdmin } from "@/lib/auth-utils"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditInspectionPage({ params }: Props) {
  try {
    await requireAdmin()
  } catch {
    redirect("/dashboard")
  }

  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Buscar vistoria
  const { data: inspection, error } = await supabase.from("inspections").select("*").eq("id", id).single()

  if (error || !inspection) {
    notFound()
  }

  // Buscar itens do checklist
  const { data: items } = await supabase.from("checklist_items").select("*").eq("inspection_id", id)

  // Buscar franquias
  const { data: franchises } = await supabase.from("franchises").select("*").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-orange-900">Editar Vistoria</h1>
          <p className="text-sm text-orange-700">Atualize os dados da vistoria</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <InspectionEditForm
          inspection={inspection}
          items={items || []}
          franchises={franchises || []}
          userId={user.id}
        />
      </main>
    </div>
  )
}
