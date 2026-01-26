import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import InspectionForm from "@/components/inspection-form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function NewInspectionPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const rawSector = searchParams?.sector
  const sector = Array.isArray(rawSector) ? rawSector[0] : rawSector

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
        {!sector && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Selecione um setor</CardTitle>
              <CardDescription>Escolha abaixo para iniciar a vistoria.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { id: "limpeza", name: "Limpeza" },
                  { id: "garcom", name: "Garçom" },
                  { id: "balanca", name: "Balança" },
                  { id: "cozinha", name: "Cozinha" },
                  { id: "preventiva", name: "Manutenção Preventiva" },
                  { id: "atendimento", name: "Atendimento" },
                  { id: "chopp", name: "Chopp" },
                  { id: "medias", name: "Médias" },
                ].map((s) => (
                  <Button key={s.id} asChild variant="secondary" className="justify-start">
                    <Link href={`/dashboard/inspection/new?sector=${s.id}`}>{s.name}</Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        <InspectionForm
          userId={user.id}
          franchises={franchises || []}
          defaultFranchiseId={userData?.franchise_id || ""}
          defaultSector={sector}
        />
      </main>
    </div>
  )
}
