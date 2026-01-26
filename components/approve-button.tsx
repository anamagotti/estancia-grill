"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ApproveButton({
  id,
  userId,
  action,
}: {
  id: string
  userId: string
  action: "approved" | "rejected"
}) {
  const router = useRouter()
  const label = action === "approved" ? "Aprovar" : "Reprovar"
  const variant = action === "approved" ? "default" : "destructive"

  async function handle() {
    await fetch(`/api/inspections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approval_status: action, approved_by: userId, approved_at: new Date().toISOString() }),
    })
    router.refresh()
  }

  return (
    <Button onClick={handle} variant={variant}>
      {label}
    </Button>
  )
}
