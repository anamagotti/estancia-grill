import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import InspectionForm from "@/components/inspection-form"

export default async function NewInspectionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Buscar franquias disponíveis
  const { data: franchises } = await supabase.from("franchises").select("*").order("name")

  // Buscar dados do usuário para pegar a franquia padrão
  const { data: userData } = await supabase.from("users").select("franchise_id").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-orange-900">Nova Vistoria</h1>
          <p className="text-sm text-orange-700">Preencha o checklist da vistoria</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <InspectionForm
          userId={user.id}
          franchises={franchises || []}
          defaultFranchiseId={userData?.franchise_id || ""}
        />
      </main>
    </div>
  )
}
