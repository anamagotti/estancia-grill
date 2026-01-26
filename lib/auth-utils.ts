import { createServerClient } from "@/lib/supabase/server"

function normalizeRole(value?: string) {
  if (!value) return ""
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // remove acentos
}

export async function getCurrentUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Busca também metadados do auth (caso role esteja lá)
  const metaRole = normalizeRole((user as any)?.user_metadata?.role || (user as any)?.app_metadata?.role)
  const dbRole = normalizeRole(userProfile?.role || "supervisor")
  const role = metaRole || dbRole

  return {
    ...user,
    role,
    franchise_id: userProfile?.franchise_id,
    full_name: userProfile?.full_name,
  }
}

export async function isAdmin() {
  const user = await getCurrentUser()
  const role = normalizeRole(user?.role)
  return ["admin", "adm", "administrator", "administrador"].includes(role)
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error("Acesso negado. Apenas administradores podem acessar.")
  }
  return true
}
