import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"
import ExportPDFButton from "@/components/export-pdf-button"
import Image from "next/image"

type Props = {
  params: Promise<{ id: string }>
}

export default async function InspectionDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Buscar vistoria
  const { data: inspection, error } = await supabase
    .from("inspections")
    .select("*, franchises(name, location), users(full_name, email)")
    .eq("id", id)
    .single()

  if (error || !inspection) {
    notFound()
  }

  // Buscar todas as vistorias dessa franquia nesta data
  const { data: rawRelatedInspections } = await supabase
    .from("inspections")
    .select("*, franchises(name, location), users(full_name, email)")
    .eq("franchise_id", inspection.franchise_id)
    .eq("inspection_date", inspection.inspection_date)
    .order("created_at", { ascending: false })

  // Deduplicar por setor (manter apenas o mais recente)
  const relatedInspections = rawRelatedInspections?.reduce((acc, curr) => {
    if (!acc.find((i) => i.sector === curr.sector)) {
      acc.push(curr)
    }
    return acc
  }, [] as typeof rawRelatedInspections) || []

  const relatedIds = relatedInspections?.map((i) => i.id) || [id]

  // Buscar itens de todas as vistorias relacionadas
  const { data: allItems } = await supabase
    .from("checklist_items")
    .select("*")
    .in("inspection_id", relatedIds)
    .order("created_at")

  const allItemIds = allItems?.map((item) => item.id) || []
  const { data: allPhotos } = await supabase
    .from("checklist_item_photos")
    .select("*")
    .in("checklist_item_id", allItemIds)

  // Agrupar fotos por item
  const photosByItem =
    allPhotos?.reduce(
      (acc, photo) => {
        if (!acc[photo.checklist_item_id]) {
          acc[photo.checklist_item_id] = []
        }
        acc[photo.checklist_item_id].push(photo)
        return acc
      },
      {} as Record<string, typeof allPhotos>,
    ) || {}

  const inspectionSectorMap = relatedInspections?.reduce((acc, curr) => {
    acc[curr.id] = curr.sector
    return acc
  }, {} as Record<string, string>) || {}

  // Preparar itens para o PDF (todos os itens)
  const allItemsWithPhotos = allItems?.map((item) => ({
    ...item,
    sector: inspectionSectorMap[item.inspection_id],
    photos: photosByItem[item.id]?.map((p) => p.photo_url) || (item.photo_url ? [item.photo_url] : []),
  })) || []

  // Calcular totais unificados
  const totalPoints = relatedInspections?.reduce((acc, curr) => acc + curr.total_points, 0) || 0
  const pointsAchieved = relatedInspections?.reduce((acc, curr) => acc + curr.points_achieved, 0) || 0
  const totalPercentage = totalPoints > 0 ? (pointsAchieved / totalPoints) * 100 : 0

  const totalOkCount = allItems?.filter((i) => i.status === "OK").length || 0
  const totalNoCount = allItems?.filter((i) => i.status === "NO").length || 0

  let unifiedRating = "PONTUAÇÃO ALCANÇADA"
  if (totalPercentage >= 92.6) unifiedRating = "EXCELENTE"
  else if (totalPercentage >= 72.8) unifiedRating = "BOM"
  else if (totalPercentage >= 22) unifiedRating = "MUITO RUIM"

  // Objeto de inspeção unificado para o PDF
  const unifiedInspection = {
    ...inspection,
    sector: "TODOS OS SETORES",
    total_points: totalPoints,
    points_achieved: pointsAchieved,
    percentage: totalPercentage,
    rating: unifiedRating
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-orange-900">Detalhes da Vistoria</h1>
              <p className="text-sm text-orange-700">Visualize e exporte o relatório completo</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/history">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">Vistoria Unificada</CardTitle>
                  <CardDescription className="mt-2">
                    {new Date(inspection.inspection_date).toLocaleDateString("pt-BR", {
                      dateStyle: "long",
                    })}
                  </CardDescription>
                </div>
                <Badge
                  className={`text-base ${
                    unifiedRating === "EXCELENTE"
                      ? "bg-green-500"
                      : unifiedRating === "BOM"
                        ? "bg-blue-500"
                        : "bg-red-500"
                  }`}
                >
                  {unifiedRating}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Franquia</p>
                  <p className="font-medium">{inspection.franchises?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Setor</p>
                  <p className="font-medium capitalize">Todos os Setores</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inspetor</p>
                  <p className="font-medium">Robson Alexandre</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">{new Date(inspection.inspection_date).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Pontos Possíveis</p>
                    <p className="text-3xl font-bold">{totalPoints}</p>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Pontos Alcançados</p>
                    <p className="text-3xl font-bold text-green-600">{pointsAchieved}</p>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Percentual</p>
                    <p className="text-3xl font-bold text-blue-600">{totalPercentage.toFixed(1)}%</p>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Items OK / NO</p>
                    <p className="text-3xl font-bold">
                      <span className="text-green-600">{totalOkCount}</span> /{" "}
                      <span className="text-red-600">{totalNoCount}</span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <ExportPDFButton inspection={unifiedInspection} items={allItemsWithPhotos} />
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/inspection/${id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Vistoria
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {relatedInspections?.map((sectorInspection) => {
            const sectorItems = allItems?.filter((i) => i.inspection_id === sectorInspection.id) || []
            const sectorGroupedItems = sectorItems.reduce(
              (acc, item) => {
                if (!acc[item.category]) {
                  acc[item.category] = []
                }
                acc[item.category].push(item)
                return acc
              },
              {} as Record<string, typeof sectorItems>,
            )

            return (
              <div key={sectorInspection.id} className="space-y-6">
                <h2 className="text-2xl font-bold text-orange-900 border-b-2 border-orange-200 pb-2 mt-8">
                  Setor: {sectorInspection.sector}
                </h2>
                {Object.entries(sectorGroupedItems).map(([category, categoryItems]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle>{category}</CardTitle>
                      <CardDescription>
                        {categoryItems.filter((i) => i.status === "OK").length} de {categoryItems.length} itens aprovados
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {categoryItems.map((item) => (
                          <div
                            key={item.id}
                            className={`rounded-lg border-2 p-4 ${
                              item.status === "OK" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{item.item_name}</p>
                                <p className="text-sm text-muted-foreground">{item.points} pontos</p>
                              </div>
                              <Badge variant={item.status === "OK" ? "default" : "destructive"}>{item.status}</Badge>
                            </div>
                            {item.observation && (
                              <div className="mt-3 space-y-1">
                                <p className="text-sm font-medium">Observação:</p>
                                <p className="text-sm text-muted-foreground">{item.observation}</p>
                              </div>
                            )}
                            {item.responsible && (
                              <div className="mt-2">
                                <p className="text-sm">
                                  <span className="font-medium">Responsável:</span> {item.responsible}
                                </p>
                              </div>
                            )}
                            {photosByItem[item.id] && photosByItem[item.id].length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-sm font-medium">Fotos ({photosByItem[item.id].length}):</p>
                                <div className="flex flex-wrap gap-2">
                                  {photosByItem[item.id].map((photo) => (
                                    <div key={photo.id} className="relative h-24 w-24 rounded-lg border">
                                      <Image
                                        src={photo.photo_url || "/placeholder.svg"}
                                        alt="Foto da vistoria"
                                        fill
                                        className="rounded-lg object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
