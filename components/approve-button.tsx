"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

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
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")

  async function confirm() {
    const body: Record<string, any> = { approval_status: action }
    if (action === "approved") {
      body.approved_by = userId
      body.approved_at = new Date().toISOString()
      if (reason) body.approval_note = reason
    } else {
      body.rejected_by = userId
      body.rejected_at = new Date().toISOString()
      body.rejection_reason = reason
    }
    await fetch(`/api/inspections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setOpen(false)
    setReason("")
    router.refresh()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant}>{label}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{label} vistoria</AlertDialogTitle>
          <AlertDialogDescription>
            {action === "approved"
              ? "Opcional: adicione uma observação de aprovação."
              : "Obrigatório: informe o motivo da reprovação."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={action === "approved" ? "Observação (opcional)" : "Motivo da reprovação"}
          className="min-h-24"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirm} disabled={action === "rejected" && reason.trim().length === 0}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
