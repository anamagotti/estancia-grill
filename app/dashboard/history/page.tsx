import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Eye } from "lucide-react"
import HistorySearch from "@/components/history-search"
import DeleteInspectionButton from "@/components/delete-inspection-button"

type SearchParams = Promise<{
  sector?: string
  franchise?: string
  rating?: string
  date_from?: string
  date_to?: string
}>

type Props = {
  searchParams: SearchParams
}

export default async function HistoryPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Construir query com filtros
  let query = supabase
    .from("inspections")
    .select("*, franchises(name, location), users(full_name, email)", { count: "exact" })
    .order("inspection_date", { ascending: false })

  if (params.sector) {
    query = query.eq("sector", params.sector)
  }

  if (params.franchise) {
    query = query.eq("franchise_id", params.franchise)
  }

  if (params.rating) {
    query = query.eq("rating", params.rating)
  }

  if (params.date_from) {
    query = query.gte("inspection_date", params.date_from)
  }

  if (params.date_to) {
    query = query.lte("inspection_date", params.date_to)
  }

  const { data: inspections, count } = await query

  // Buscar franquias para o filtro
  const { data: franchises } = await supabase.from("franchises").select("*").order("name")

  // Agrupar vistorias por franquia e data
  const groupedInspections = inspections?.reduce((acc, curr) => {
    const key = `${curr.franchise_id}-${curr.inspection_date}`
    if (!acc[key]) {
      acc[key] = {
        ...curr,
        sector: "Vistoria Completa",
        total_points: 0,
        points_achieved: 0,
        sectors_count: 0,
        original_ids: []
      }
    }
    acc[key].total_points += curr.total_points
    acc[key].points_achieved += curr.points_achieved
    acc[key].sectors_count += 1
    acc[key].original_ids.push(curr.id)
    return acc
  }, {} as Record<string, any>)

  const displayedInspections = Object.values(groupedInspections || {}).map(i => {
    const percentage = i.total_points > 0 ? (i.points_achieved / i.total_points) * 100 : 0
    let rating = "PONTUAÇÃO ALCANÇADA"
    if (percentage >= 92.6) rating = "EXCELENTE"
    else if (percentage >= 72.8) rating = "BOM"
    else if (percentage >= 22) rating = "MUITO RUIM"
    
    return {
      ...i,
      percentage,
      rating
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-orange-900">Histórico de Vistorias</h1>
              <p className="text-sm text-orange-700">Busque e visualize vistorias anteriores</p>
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
        <HistorySearch franchises={franchises || []} initialParams={params} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resultados da Busca</CardTitle>
            <CardDescription>
              {displayedInspections.length} {displayedInspections.length === 1 ? "vistoria encontrada" : "vistorias encontradas"} (agrupadas por data)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {displayedInspections.length > 0 ? (
              <div className="space-y-4">
                {displayedInspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="flex flex-col gap-4 rounded-lg border-2 border-orange-100 bg-white p-4 transition-all hover:border-orange-300 hover:shadow-md md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold capitalize">{inspection.sector}</h3>
                        <Badge
                          className={`${
                            inspection.rating === "EXCELENTE"
                              ? "bg-green-500"
                              : inspection.rating === "BOM"
                                ? "bg-blue-500"
                                : "bg-red-500"
                          }`}
                        >
                          {inspection.rating}
                        </Badge>
                      </div>

                      <div className="grid gap-2 text-sm md:grid-cols-3">
                        <div>
                          <span className="text-muted-foreground">Franquia:</span>
                          <p className="font-medium">{inspection.franchises?.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data:</span>
                          <p className="font-medium">
                            {new Date(inspection.inspection_date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Inspetor:</span>
                          <p className="font-medium">
                            Robson Alexandre
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Pontuação:</span>
                          <span className="ml-1 font-bold text-orange-600">
                            {inspection.points_achieved}/{inspection.total_points}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Percentual:</span>
                          <span className="ml-1 font-bold text-blue-600">{inspection.percentage?.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 md:flex-col">
                      <Button asChild className="flex-1">
                        <Link href={`/dashboard/inspection/${inspection.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </Link>
                      </Button>
                      <DeleteInspectionButton inspectionId={inspection.id} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-lg">Nenhuma vistoria encontrada</p>
                <p className="mt-2 text-sm">Tente ajustar os filtros de busca</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
