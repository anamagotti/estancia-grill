"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function PromoteAdminPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handlePromote() {
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch("/api/admin/promote-by-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!res.ok) {
        setStatus(json.error || "Falha ao promover")
      } else {
        setStatus("Usuário promovido a admin com sucesso.")
        router.push("/dashboard")
      }
    } catch (e: any) {
      setStatus(e.message || "Erro inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Promover Admin</CardTitle>
          <CardDescription>
            Se ainda não existe admin, qualquer usuário pode promover pelo e-mail. Depois disso, somente admin pode promover.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handlePromote} disabled={loading || !email}>
            {loading ? "Promovendo..." : "Promover"}
          </Button>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
