"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import {
  CHECKLIST_ATENDIMENTO,
  CHECKLIST_BALANÇA,
  CHECKLIST_CHOPP,
  CHECKLIST_COZINHA,
  CHECKLIST_GARCOM,
  CHECKLIST_LIMPEZA,
  CHECKLIST_MEDIAS,
  CHECKLIST_PREVENTIVA,
  type ChecklistSection,
} from "@/lib/checklist-data"
import { calculateRating } from "@/lib/utils"
import type { Franchise } from "@/types/inspection"
import { ArrowLeft, Save, Camera, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const getChecklistBySector = (sectorId: string): ChecklistSection[] => {
  switch (sectorId) {
    case "limpeza":
      return CHECKLIST_LIMPEZA
    case "garcom":
      return CHECKLIST_GARCOM
    case "balanca":
      return CHECKLIST_BALANÇA
    case "cozinha":
      return CHECKLIST_COZINHA
    case "preventiva":
      return CHECKLIST_PREVENTIVA
    case "atendimento":
      return CHECKLIST_ATENDIMENTO
    case "chopp":
      return CHECKLIST_CHOPP
    case "medias":
      return CHECKLIST_MEDIAS
    default:
      return []
  }
}

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
  const selectedSector = inspection.sector

  const [photosByItem, setPhotosByItem] = useState<Record<string, { before?: { id: string; photo_url: string }; after?: { id: string; photo_url: string } }>>({})
  const [uploading, setUploading] = useState<Record<string, { before?: boolean; after?: boolean }>>({})

  const [currentResponses, setCurrentResponses] = useState<Record<string, ItemResponse>>(() => {
    return items.reduce(
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
    )
  })

  const currentChecklist = getChecklistBySector(inspection.sector)

  const handleItemChange = (itemId: string, field: keyof Omit<ItemResponse, "id">, value: string) => {
    setCurrentResponses((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }))
  }

  const calculateScore = () => {
    let totalPoints = 0
    let achievedPoints = 0

    items.forEach((item) => {
      totalPoints += item.points
      if (currentResponses[item.id]?.status === "OK") {
        achievedPoints += item.points
      }
    })

    const percentage = totalPoints > 0 ? (achievedPoints / totalPoints) * 100 : 0

    return { total: totalPoints, achieved: achievedPoints, percentage }
  }

  // Carregar fotos existentes dos itens
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const entries = await Promise.all(
          items.map(async (it) => {
            const res = await fetch(`/api/checklist-items/${it.id}/photos`)
            if (!res.ok) return [it.id, {} as { before?: { id: string; photo_url: string }; after?: { id: string; photo_url: string } }] as const
            const { data } = await res.json()
            // Mapear para slots before/after quando possível
            const mapped = (data as Array<{ id: string; photo_url: string; photo_type?: string }>).
              reduce((acc, p) => {
                if (p.photo_type === 'before' && !acc.before) acc.before = { id: p.id, photo_url: p.photo_url }
                else if (p.photo_type === 'after' && !acc.after) acc.after = { id: p.id, photo_url: p.photo_url }
                else if (!acc.before) acc.before = { id: p.id, photo_url: p.photo_url }
                else if (!acc.after) acc.after = { id: p.id, photo_url: p.photo_url }
                return acc
              }, {} as { before?: { id: string; photo_url: string }; after?: { id: string; photo_url: string } })
            return [it.id, mapped] as const
          }),
        )
        setPhotosByItem(Object.fromEntries(entries))
      } catch (e) {
        // ignore silently
      }
    }
    loadPhotos()
  }, [items])

  const handleAddPhoto = async (itemId: string, which: 'before' | 'after', file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Erro", description: "Selecione uma imagem", variant: "destructive" })
      return
    }
    setUploading((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), [which]: true } }))
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        const res = await fetch(`/api/checklist-items/${itemId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photo: base64, type: which }),
        })
        if (!res.ok) throw new Error("Falha ao salvar foto")
        const { data } = await res.json()
        // Inserir no slot correto
        const inserted = (data as Array<{ id: string; photo_url: string; photo_type?: string }>)[0]
        setPhotosByItem((prev) => ({
          ...prev,
          [itemId]: {
            ...(prev[itemId] || {}),
            [which]: { id: inserted.id, photo_url: inserted.photo_url },
          },
        }))
        setUploading((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), [which]: false } }))
      }
      reader.readAsDataURL(file)
    } catch (e) {
      setUploading((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), [which]: false } }))
      toast({ title: "Erro", description: "Erro ao adicionar foto", variant: "destructive" })
    }
  }

  const handleRemovePhoto = async (itemId: string, photoId: string, which?: 'before' | 'after') => {
    try {
      const res = await fetch(`/api/checklist-items/${itemId}/photos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      })
      if (!res.ok) throw new Error()
      setPhotosByItem((prev) => ({
        ...prev,
        [itemId]: {
          ...(prev[itemId] || {}),
          ...(which ? { [which]: undefined } : {}),
        },
      }))
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível remover a foto", variant: "destructive" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Fotos são opcionais; não bloquear o envio. Mensagens visuais orientam o usuário.

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
      const updatePromises = Object.values(currentResponses).map((response) =>
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

      {
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
                  const response = currentResponses[item.id]

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

                      <div className="space-y-2">
                            <Label className="text-sm">Fotos</Label>
                            {response.status === 'OK' ? (
                              <div className="flex flex-wrap gap-4">
                                {/* Antes */}
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">Antes</p>
                                  <div className="relative h-24 w-24 rounded-lg border">
                                    {photosByItem[item.id]?.before ? (
                                      <Image src={photosByItem[item.id]!.before!.photo_url} alt="Antes" fill className="rounded-lg object-cover" />
                                    ) : (
                                      <label className="flex h-full w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleAddPhoto(item.id, 'before', file)
                                          }}
                                          disabled={!!uploading[item.id]?.before}
                                        />
                                        <Camera className="h-6 w-6 text-muted-foreground" />
                                      </label>
                                    )}
                                    {photosByItem[item.id]?.before && (
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                                        onClick={() => handleRemovePhoto(item.id, photosByItem[item.id]!.before!.id, 'before')}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {/* Depois */}
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">Depois</p>
                                  <div className="relative h-24 w-24 rounded-lg border">
                                    {photosByItem[item.id]?.after ? (
                                      <Image src={photosByItem[item.id]!.after!.photo_url} alt="Depois" fill className="rounded-lg object-cover" />
                                    ) : (
                                      <label className="flex h-full w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleAddPhoto(item.id, 'after', file)
                                          }}
                                          disabled={!!uploading[item.id]?.after}
                                        />
                                        <Camera className="h-6 w-6 text-muted-foreground" />
                                      </label>
                                    )}
                                    {photosByItem[item.id]?.after && (
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                                        onClick={() => handleRemovePhoto(item.id, photosByItem[item.id]!.after!.id, 'after')}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Foto do problema</p>
                                <div className="relative h-24 w-24 rounded-lg border">
                                  {photosByItem[item.id]?.before ? (
                                    <Image src={photosByItem[item.id]!.before!.photo_url} alt="Problema" fill className="rounded-lg object-cover" />
                                  ) : (
                                    <label className="flex h-full w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0]
                                          if (file) handleAddPhoto(item.id, 'before', file)
                                        }}
                                        disabled={!!uploading[item.id]?.before}
                                      />
                                      <Camera className="h-6 w-6 text-muted-foreground" />
                                    </label>
                                  )}
                                  {photosByItem[item.id]?.before && (
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                                      onClick={() => handleRemovePhoto(item.id, photosByItem[item.id]!.before!.id, 'before')}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                            {response.status === "OK" && (!photosByItem[item.id]?.before || !photosByItem[item.id]?.after) && (
                              <p className="text-sm text-destructive">Para marcar como OK, adicione 2 fotos (antes e depois).</p>
                            )}
                            {response.status === "NO" && !photosByItem[item.id]?.before && (
                              <p className="text-sm text-destructive">Adicione ao menos 1 foto do problema.</p>
                            )}
                          </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </>
      }

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
