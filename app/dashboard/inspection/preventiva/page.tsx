import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import InspectionForm from "@/components/inspection-form"

export const dynamic = "force-dynamic"

export default async function PreventivaInspectionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: franchises } = await supabase.from("franchises").select("*").order("name")
  const { data: userData } = await supabase.from("users").select("franchise_id").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <main className="container mx-auto px-4 py-8">
        <InspectionForm
          userId={user.id}
          franchises={franchises || []}
          defaultFranchiseId={userData?.franchise_id || ""}
          defaultSector="preventiva"
        />
      </main>
    </div>
  )
}
