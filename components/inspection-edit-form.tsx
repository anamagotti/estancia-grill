"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { SECTORS, calculateRating } from "@/lib/checklist-data"
import type { Franchise } from "@/types/inspection"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

type Props = {
  inspection: {
    id: string
    franchise_id: string
    inspection_date: string
    sector: string
  }
  items: Array<{
    id: string
    category: string
    item_name: string
    status: string
    points: number
    observation: string | null
    responsible: string | null
  }>
  franchises: Franchise[]
  userId: string
}

type ItemResponse = {
  id: string
  status: "OK" | "NO"
  observation: string
  responsible: string
}

export default function InspectionEditForm({ inspection, items, franchises, userId }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [franchiseId, setFranchiseId] = useState(inspection.franchise_id)
  const [inspectionDate, setInspectionDate] = useState(inspection.inspection_date)
  const [responses, setResponses] = useState<Record<string, ItemResponse>>(
    items.reduce(
      (acc, item) => {
        acc[item.id] = {
          id: item.id,
          status: item.status as "OK" | "NO",
          observation: item.observation || "",
          responsible: item.responsible || "",
        }
        return acc
      },
      {} as Record<string, ItemResponse>,
    ),
  )

  const selectedSector = SECTORS.find((s) => s.id === inspection.sector)

  const handleItemChange = (itemId: string, field: keyof Omit<ItemResponse, "id">, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }))
  }

  const calculateScore = () => {
    if (!selectedSector) return { total: 0, achieved: 0, percentage: 0 }

    let totalPoints = 0
    let achievedPoints = 0

    items.forEach((item) => {
      totalPoints += item.points
      if (responses[item.id]?.status === "OK") {
        achievedPoints += item.points
      }
    })

    const percentage = totalPoints > 0 ? (achievedPoints / totalPoints) * 100 : 0

    return { total: totalPoints, achieved: achievedPoints, percentage }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const score = calculateScore()
      const rating = calculateRating(score.percentage)

      // Atualizar a vistoria
      const inspectionResponse = await fetch(`/api/inspections/${inspection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          franchise_id: franchiseId,
          inspection_date: inspectionDate,
          total_points: score.total,
          points_achieved: score.achieved,
          percentage: score.percentage,
          rating,
        }),
      })

      if (!inspectionResponse.ok) throw new Error("Erro ao atualizar vistoria")

      // Atualizar os itens
      const updatePromises = Object.values(responses).map((response) =>
        fetch(`/api/checklist-items/${response.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: response.status,
            observation: response.observation,
            responsible: response.responsible,
          }),
        }),
      )

      await Promise.all(updatePromises)

      toast({
        title: "Sucesso!",
        description: "Vistoria atualizada com sucesso",
      })

      router.push(`/dashboard/inspection/${inspection.id}`)
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar vistoria",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const score = calculateScore()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Vistoria</CardTitle>
          <CardDescription>Atualize os dados da vistoria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="franchise">Franquia</Label>
              <Select value={franchiseId} onValueChange={setFranchiseId}>
                <SelectTrigger id="franchise">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {franchises.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Setor</Label>
              <Input id="sector" value={selectedSector?.name} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle>Pontuação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Pontos Possíveis</p>
              <p className="text-2xl font-bold">{score.total}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pontos Alcançados</p>
              <p className="text-2xl font-bold">{score.achieved}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Percentual</p>
              <p className="text-2xl font-bold">{score.percentage.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avaliação</p>
              <p className="text-2xl font-bold">{calculateRating(score.percentage)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSector && (
        <>
          {Object.entries(
            items.reduce(
              (acc, item) => {
                if (!acc[item.category]) {
                  acc[item.category] = []
                }
                acc[item.category].push(item)
                return acc
              },
              {} as Record<string, typeof items>,
            ),
          ).map(([category, categoryItems]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {categoryItems.map((item) => {
                  const response = responses[item.id]

                  return (
                    <div key={item.id} className="space-y-3 rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium">{item.item_name}</p>
                          <p className="text-sm text-muted-foreground">{item.points} pontos</p>
                        </div>
                        <RadioGroup
                          value={response.status}
                          onValueChange={(value) => handleItemChange(item.id, "status", value)}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="OK" id={`${item.id}-ok`} />
                            <Label htmlFor={`${item.id}-ok`} className="cursor-pointer font-normal">
                              OK
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="NO" id={`${item.id}-no`} />
                            <Label htmlFor={`${item.id}-no`} className="cursor-pointer font-normal">
                              NO
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {response.status === "NO" && (
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`${item.id}-obs`} className="text-sm">
                              Observação
                            </Label>
                            <Textarea
                              id={`${item.id}-obs`}
                              value={response.observation}
                              onChange={(e) => handleItemChange(item.id, "observation", e.target.value)}
                              placeholder="Descreva o problema..."
                              rows={2}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${item.id}-resp`} className="text-sm">
                              Responsável
                            </Label>
                            <Input
                              id={`${item.id}-resp`}
                              value={response.responsible}
                              onChange={(e) => handleItemChange(item.id, "responsible", e.target.value)}
                              placeholder="Nome do responsável"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </>
      )}

      <div className="flex gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href={`/dashboard/inspection/${inspection.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  )
}
