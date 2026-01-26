import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  Plus,
  FileText,
  BarChart3,
  LogOut,
  Shield,
  Utensils,
  ConciergeBell,
  Scale,
  CookingPot,
  Flame,
  Car,
  Wrench,
  Settings,
} from "lucide-react"
import { getCurrentUser } from "@/lib/auth-utils"
import Image from "next/image"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const currentUser = await getCurrentUser()
  const isAdmin = currentUser?.role === "admin"
  const isCleaner = currentUser?.role === "limpeza"

  // Buscar dados do usuário
  const { data: userData } = await supabase.from("users").select("*, franchises(*)").eq("id", user.id).single()

  // Buscar estatísticas de vistorias
  const { data: inspections, count } = await supabase
    .from("inspections")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Image
              src="/images/estancia-grill-logo.png"
              alt="Estância Grill"
              width={120}
              height={90}
              className="h-auto w-28"
            />
            <div>
              <h1 className="text-xl font-bold text-primary">Estância Grill</h1>
              <p className="text-sm text-muted-foreground">Sistema de Vistorias</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{userData?.full_name || user.email}</p>
              <p className="text-xs text-muted-foreground">{userData?.franchises?.name || "Sem franquia"}</p>
            </div>
            <form action="/api/auth/signout" method="post">
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Bem-vindo ao sistema de vistorias automatizado</p>
        </div>

        {!isCleaner && (
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total de Vistorias</CardTitle>
                <CardDescription>Vistorias realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{count || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Este Mês</CardTitle>
                <CardDescription>Vistorias do mês atual</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {
                    inspections?.filter((i) => {
                      const date = new Date(i.inspection_date)
                      const now = new Date()
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                    }).length
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Média Geral</CardTitle>
                <CardDescription>Média de aproveitamento</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {inspections && inspections.length > 0
                    ? (inspections.reduce((acc, i) => acc + (i.percentage || 0), 0) / inspections.length).toFixed(1)
                    : "0"}
                  %
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {!isCleaner && (
            <Card className="border-2 border-orange-200 shadow-lg transition-shadow hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-3">
                    <Plus className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>Nova Vistoria</CardTitle>
                    <CardDescription>Criar uma nova vistoria</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" size="lg">
                  <Link href="/dashboard/inspection/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Iniciar Vistoria
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-green-200 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-3">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Checklist Limpeza</CardTitle>
                  <CardDescription>Diário por setores</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700" size="lg">
                <Link href="/dashboard/cleaning-checklist">
                  <Shield className="mr-2 h-4 w-4" />
                  Iniciar Limpeza
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-cyan-200 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-100 p-3">
                  <ConciergeBell className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <CardTitle>Checklist Garçom</CardTitle>
                  <CardDescription>Avaliação de atendimento</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-700" size="lg">
                <Link href="/dashboard/inspection/new?sector=garcom">
                  <ConciergeBell className="mr-2 h-4 w-4" />
                  Iniciar
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-3">
                  <Scale className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <CardTitle>Checklist Balança</CardTitle>
                  <CardDescription>Aferição e limpeza</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-slate-600 hover:bg-slate-700" size="lg">
                <Link href="/dashboard/inspection/new?sector=balanca">
                  <Scale className="mr-2 h-4 w-4" />
                  Iniciar
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-3">
                  <CookingPot className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle>Checklist Cozinha</CardTitle>
                  <CardDescription>Processos e higiene</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-red-600 hover:bg-red-700" size="lg">
                <Link href="/dashboard/inspection/new?sector=cozinha">
                  <CookingPot className="mr-2 h-4 w-4" />
                  Iniciar
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-3">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Checklist Churrasqueira</CardTitle>
                  <CardDescription>Limpeza e preparo</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700" size="lg">
                <Link href="/dashboard/inspection/new?sector=churrasqueira">
                  <Flame className="mr-2 h-4 w-4" />
                  Iniciar
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-3">
                  <Car className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <CardTitle>Checklist Estacionamento</CardTitle>
                  <CardDescription>Organização e segurança</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-gray-600 hover:bg-gray-700" size="lg">
                <Link href="/dashboard/inspection/new?sector=estacionamento">
                  <Car className="mr-2 h-4 w-4" />
                  Iniciar
                </Link>
              </Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="border-2 border-indigo-200 shadow-lg transition-shadow hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-100 p-3">
                    <Wrench className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle>Manutenção Preventiva</CardTitle>
                    <CardDescription>Registrar um problema</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg">
                  <Link href="/dashboard/inspection/new?sector=preventiva">
                    <Wrench className="mr-2 h-4 w-4" />
                    Registrar
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {!isCleaner && inspections && inspections.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Vistorias Recentes</CardTitle>
              <CardDescription>Últimas 5 vistorias realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspections.map((inspection) => (
                  <Link key={inspection.id} href={`/dashboard/inspection/${inspection.id}`}>
                    <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent">
                      <div className="flex-1">
                        <p className="font-medium">{inspection.sector}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(inspection.inspection_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold">{inspection.percentage?.toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">{inspection.rating}</p>
                        </div>
                        <div
                          className={`h-3 w-3 rounded-full ${
                            inspection.rating === "EXCELENTE"
                              ? "bg-green-500"
                              : inspection.rating === "BOM"
                                ? "bg-blue-500"
                                : "bg-red-500"
                          }`}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
