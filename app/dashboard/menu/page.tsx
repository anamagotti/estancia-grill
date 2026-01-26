import { MenuManager } from "@/components/menu-manager"
import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/auth-utils"

export const metadata: Metadata = {
  title: "Gerenciamento de Cardápio | Estância Grill",
  description: "Gerencie o cardápio do dia",
}

export default async function MenuPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }
  const admin = await isAdmin()
  if (!admin) {
    redirect("/dashboard")
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold">Cardápio do Dia</h2>
        <p className="text-muted-foreground">Adicione e gerencie os itens do cardápio diário.</p>
      </div>
      
      <MenuManager />
    </div>
  )
}
