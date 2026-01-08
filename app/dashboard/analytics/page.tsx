import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import InspectionChart from "@/components/inspection-chart"
import SectorPerformanceChart from "@/components/sector-performance-chart"
import TrendChart from "@/components/trend-chart"
import TopIssuesChart from "@/components/top-issues-chart"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Buscar todas as vistorias
  const { data: inspections } = await supabase
    .from("inspections")
    .select("*, franchises(name)")
    .order("inspection_date", { ascending: false })

  // Buscar todos os itens de checklist com problemas
  const { data: issues } = await supabase
    .from("checklist_items")
    .select("*, inspections(sector, inspection_date)")
    .eq("status", "NO")
    .order("created_at", { ascending: false })
    .limit(100)

  // Calcular estatísticas
  const totalInspections = inspections?.length || 0
  const avgScore =
    inspections && inspections.length > 0
      ? inspections.reduce((acc, i) => acc + (i.percentage || 0), 0) / inspections.length
      : 0

  const excelentCount = inspections?.filter((i) => i.rating === "EXCELENTE").length || 0
  const bomCount = inspections?.filter((i) => i.rating === "BOM").length || 0
  const ruimCount = inspections?.filter((i) => i.rating === "MUITO RUIM").length || 0

  // Agrupar por setor
  const sectorStats =
    inspections?.reduce(
      (acc, inspection) => {
        if (!acc[inspection.sector]) {
          acc[inspection.sector] = { total: 0, sum: 0, count: 0 }
        }
        acc[inspection.sector].sum += inspection.percentage || 0
        acc[inspection.sector].count += 1
        acc[inspection.sector].total = acc[inspection.sector].sum / acc[inspection.sector].count
        return acc
      },
      {} as Record<string, { total: number; sum: number; count: number }>,
    ) || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-orange-900">Análises e Gráficos</h1>
              <p className="text-sm text-orange-700">Visualize o desempenho das vistorias</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Vistorias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalInspections}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{avgScore.toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Excelentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{excelentCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Muito Ruim</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{ruimCount}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Avaliação</CardTitle>
              <CardDescription>Quantidade de vistorias por classificação</CardDescription>
            </CardHeader>
            <CardContent>
              <InspectionChart excelent={excelentCount} good={bomCount} bad={ruimCount} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Setor</CardTitle>
              <CardDescription>Média de pontuação por setor</CardDescription>
            </CardHeader>
            <CardContent>
              <SectorPerformanceChart data={sectorStats} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tendência ao Longo do Tempo</CardTitle>
              <CardDescription>Evolução das pontuações das últimas vistorias</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart inspections={inspections || []} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Principais Problemas</CardTitle>
              <CardDescription>Itens mais frequentemente marcados como "NO"</CardDescription>
            </CardHeader>
            <CardContent>
              <TopIssuesChart issues={issues || []} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
