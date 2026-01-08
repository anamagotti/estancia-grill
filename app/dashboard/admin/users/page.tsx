import { redirect } from "next/navigation"
import { requireAdmin, getCurrentUser } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserManagement } from "@/components/user-management"

export default async function AdminUsersPage() {
  try {
    await requireAdmin()
  } catch {
    redirect("/dashboard")
  }

  const supabase = await createServerClient()
  const currentUser = await getCurrentUser()

  // Buscar todos os usuários
  const { data: users, error } = await supabase
    .from("profiles")
    .select("*, franchises(name)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
  }

  // Buscar todas as franquias
  const { data: franchises } = await supabase.from("franchises").select("*").order("name")

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground mt-2">Adicione novos administradores e gerencie permissões de usuários</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>Total de {users?.length || 0} usuários cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <UserManagement users={users || []} franchises={franchises || []} currentUserId={currentUser?.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
