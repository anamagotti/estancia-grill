import { createServerClient } from "@/lib/supabase/server"

export async function getCurrentUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return {
    ...user,
    role: (userProfile?.role || "supervisor").toString().toLowerCase(),
    franchise_id: userProfile?.franchise_id,
    full_name: userProfile?.full_name,
  }
}

export async function isAdmin() {
  const user = await getCurrentUser()
  const role = user?.role || ""
  return ["admin", "adm", "administrator", "administrador"].includes(role)
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error("Acesso negado. Apenas administradores podem acessar.")
  }
  return true
}
