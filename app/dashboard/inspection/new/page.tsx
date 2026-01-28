import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import InspectionForm from "@/components/inspection-form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { isAdmin } from "@/lib/auth-utils"
import ApproveButton from "@/components/approve-button"

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
  const admin = await isAdmin()

  // Restringe toda a página a administradores
  if (!admin) {
    redirect("/dashboard")
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
        {sector ? (
          <InspectionForm
            userId={user.id}
            franchises={franchises || []}
            defaultFranchiseId={userData?.franchise_id || ""}
            defaultSector={sector}
          />
        ) : (
          <AdminApprovals userId={user.id} />
        )}
      </main>
    </div>
  )
}

async function AdminApprovals({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: pending } = await supabase
    .from("inspections")
    .select("id, sector, inspection_date, percentage, rating, franchises(name)")
    .eq("approval_status", "pending")
    .order("inspection_date", { ascending: false })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Aprovação de Vistorias</CardTitle>
          <CardDescription>Revise e aprove/reprove as vistorias feitas.</CardDescription>
        </CardHeader>
        <CardContent>
          {!pending || pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma vistoria pendente no momento.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{v.franchises?.name || "Unidade"} • {v.sector}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(v.inspection_date).toLocaleDateString()} • {v.percentage?.toFixed?.(1)}% • {v.rating}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <ApproveButton id={v.id} userId={userId} action="approved" />
                    <ApproveButton id={v.id} userId={userId} action="rejected" />
                    <Button asChild variant="outline">
                      <Link href={`/dashboard/inspection/${v.id}`}>Ver detalhes</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Atalho para iniciar manutenção preventiva direto daqui */}
      <Card>
        <CardHeader>
          <CardTitle>Manutenção Preventiva</CardTitle>
          <CardDescription>Registre um problema com fotos e descrição.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/inspection/start?sector=preventiva">Iniciar registro de preventiva</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
