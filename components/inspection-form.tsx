"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { calculateRating, getRatingColor } from "@/lib/utils"
import type { Franchise } from "@/types/inspection"
import { ArrowLeft, Save, Camera, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const SECTORS = [
  { id: "limpeza", name: "Limpeza" },
  { id: "garcom", name: "Garçom" },
  { id: "balanca", name: "Balança" },
  { id: "cozinha", name: "Cozinha" },
  { id: "preventiva", name: "Manutenção Preventiva" },
  { id: "atendimento", name: "Atendimento" },
  { id: "chopp", name: "Chopp" },
  { id: "medias", name: "Médias" },
]

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
  userId: string
  franchises: Franchise[]
  defaultFranchiseId: string
  defaultSector?: string
}

type ItemResponse = {
  status: "OK" | "NO"
  observation: string
  responsible: string
  photoUrls: string[]
}

export default function InspectionForm({ userId, franchises, defaultFranchiseId, defaultSector }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [franchiseId, setFranchiseId] = useState(defaultFranchiseId)
  const [sector, setSector] = useState(defaultSector || "") // Prioriza o setor da URL; vazio quando não há setor
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split("T")[0])
  const [responses, setResponses] = useState<Record<string, ItemResponse>>({})
  const [uploadingPhotos, setUploadingPhotos] = useState<Record<string, boolean>>({})

  // Garante que o setor sempre siga o valor vindo da URL/card
  useEffect(() => {
    if (defaultSector && defaultSector !== sector) {
      setSector(defaultSector)
    }
  }, [defaultSector])

  // Client-side fallback: read sector from URL if not provided by server
  useEffect(() => {
    if (!sector) {
      const param = searchParams.get("sector")
      if (param) setSector(param)
    }
  }, [searchParams, sector])

  // Cleaning checklist: always show full set of daily tasks
  const getFilteredChecklist = (sectorId: string) => {
    const originalChecklist = getChecklistBySector(sectorId)
    return originalChecklist
  }

  const currentChecklist = sector ? getFilteredChecklist(sector) : []
  const totalPoints = currentChecklist.reduce(
    (acc, section) => acc + section.items.reduce((itemAcc, item) => itemAcc + item.points, 0),
    0,
  )

  const handleItemChange = (itemKey: string, field: keyof ItemResponse, value: string) => {
    setResponses((prev) => {
      const existing = prev[itemKey] || { status: "NO", observation: "", responsible: "", photoUrls: [] }
      return {
        ...prev,
        [itemKey]: {
          ...existing,
          [field]: value,
        },
      }
    })
  }

  const handlePhotoAdd = async (itemKey: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas imagens",
        variant: "destructive",
      })
      return
    }

    setUploadingPhotos((prev) => ({ ...prev, [itemKey]: true }))

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setResponses((prev) => {
          const existing = prev[itemKey] || { status: "NO", observation: "", responsible: "", photoUrls: [] }
          return {
            ...prev,
            [itemKey]: {
              ...existing,
              photoUrls: [...existing.photoUrls, base64],
            },
          }
        })
        setUploadingPhotos((prev) => ({ ...prev, [itemKey]: false }))
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar foto",
        variant: "destructive",
      })
      setUploadingPhotos((prev) => ({ ...prev, [itemKey]: false }))
    }
  }

  const handlePhotoRemove = (itemKey: string, photoIndex: number) => {
    setResponses((prev) => {
      const existing = prev[itemKey] || { status: "NO", observation: "", responsible: "", photoUrls: [] }
      return {
        ...prev,
        [itemKey]: {
          ...existing,
          photoUrls: existing.photoUrls.filter((_, idx) => idx !== photoIndex),
        },
      }
    })
  }

  const calculateSectorScore = (sectorId: string) => {
    const checklist = getFilteredChecklist(sectorId)
    let totalPoints = 0
    let achievedPoints = 0

    checklist.forEach((section) => {
      section.items.forEach((item) => {
        const key = `${sectorId}-${section.title}-${item.item}`
        totalPoints += item.points
        if (responses[key]?.status === "OK") {
          achievedPoints += item.points
        }
      })
    })

    const percentage = totalPoints > 0 ? (achievedPoints / totalPoints) * 100 : 0
    return { total: totalPoints, achieved: achievedPoints, percentage }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!franchiseId) {
      toast({
        title: "Erro",
        description: "Selecione a franquia",
        variant: "destructive",
      })
      return
    }

    // Validação de fotos por item conforme status
    try {
      const activeSectorId = sector
      const filteredChecklist = getFilteredChecklist(activeSectorId)
      for (const section of filteredChecklist) {
        for (const item of section.items) {
          const key = `${activeSectorId}-${section.title}-${item.item}`
          const response = responses[key] || { status: "NO", observation: "", responsible: "", photoUrls: [] }
          if (response.status === "NO" && response.photoUrls.length < 1) {
            throw new Error(`O item "${item.item}" requer ao menos 1 foto quando marcado como NO.`)
          }
          if (response.status === "OK" && response.photoUrls.length < 2) {
            throw new Error(`O item "${item.item}" requer 2 fotos (antes e depois) para marcar como OK.`)
          }
        }
      }
    } catch (err) {
      toast({
        title: "Verifique as fotos",
        description: err instanceof Error ? err.message : "Há itens sem a quantidade mínima de fotos",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Submit inspection only for selected sector
      const activeSectorId = sector
      const sectorInfo = SECTORS.find((s) => s.id === activeSectorId)
      const score = calculateSectorScore(activeSectorId)
      const rating = calculateRating(score.percentage)

      const inspectionResponse = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          franchise_id: franchiseId,
          inspector_id: userId,
          inspection_date: inspectionDate,
          sector: activeSectorId,
          total_points: score.total,
          points_achieved: score.achieved,
          percentage: score.percentage,
          rating,
          approval_status: "pending",
        }),
      })

      if (!inspectionResponse.ok) {
        const errorData = await inspectionResponse.json()
        throw new Error(errorData.error || `Erro ao criar vistoria para ${sectorInfo?.name || activeSectorId}`)
      }

      const { data: inspection } = await inspectionResponse.json()

      const filteredChecklist = getFilteredChecklist(activeSectorId)
      const items = filteredChecklist.flatMap((section) =>
        section.items.map((item) => {
          const key = `${activeSectorId}-${section.title}-${item.item}`
          const response = responses[key] || { status: "NO", observation: "", responsible: "", photoUrls: [] }
          return {
            inspection_id: inspection.id,
            category: section.title,
            item_name: item.item,
            status: response.status,
            points: item.points,
            observation: response.observation,
            responsible: response.responsible,
            photo_url: response.photoUrls[0] || null,
            photos: response.photoUrls,
          }
        }),
      )

      const itemsResponse = await fetch("/api/checklist-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })

      if (!itemsResponse.ok) {
        const errorData = await itemsResponse.json()
        throw new Error(errorData.error || `Erro ao salvar itens para ${sectorInfo?.name || activeSectorId}`)
      }

      toast({
        title: "Sucesso!",
        description: "Todas as vistorias foram criadas com sucesso",
      })

      router.push(`/dashboard/history`)
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar vistorias",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Vistoria</CardTitle>
          <CardDescription>Selecione a franquia e data da vistoria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="franchise">Franquia *</Label>
              <Select value={franchiseId} onValueChange={setFranchiseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
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
              <Label htmlFor="inspectionDate">Data da Vistoria</Label>
              <Input
                id="date"
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {(() => {
        const activeSectorId = sector
        if (!activeSectorId) {
          return (
            <div className="space-y-6 pt-6 border-t">
              <Card>
                <CardHeader>
                  <CardTitle>Selecione um setor</CardTitle>
                  <CardDescription>Escolha abaixo um setor para iniciar.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="secondary">
                    <Link href="/dashboard">Voltar ao dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )
        }
        const sectorInfo = SECTORS.find((s) => s.id === activeSectorId)
        const filteredChecklist = getFilteredChecklist(activeSectorId)
        const score = calculateSectorScore(activeSectorId)

        return (
          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">{sectorInfo?.name || activeSectorId}</h2>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-muted-foreground">Pontuação</p>
                  <p className="text-lg font-bold">{score.percentage.toFixed(1)}%</p>
                </div>
                <div
                  className={`px-4 py-2 rounded-lg font-bold text-white ${getRatingColor(calculateRating(score.percentage))}`}
                >
                  {calculateRating(score.percentage)}
                </div>
              </div>
            </div>

            {filteredChecklist.map((section, sectionIdx) => (
              <Card key={sectionIdx}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.items.map((item, itemIdx) => {
                    const key = `${activeSectorId}-${section.title}-${item.item}`
                    const response = responses[key] || { status: "NO", observation: "", responsible: "", photoUrls: [] }

                    return (
                      <div key={itemIdx} className="space-y-3 rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{item.item}</p>
                            <p className="text-sm text-muted-foreground">{item.points} pontos</p>
                          </div>
                          <RadioGroup
                            value={response.status}
                            onValueChange={(value) => handleItemChange(key, "status", value)}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="OK" id={`${key}-ok`} />
                              <Label htmlFor={`${key}-ok`} className="cursor-pointer font-normal">
                                OK
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="NO" id={`${key}-no`} />
                              <Label htmlFor={`${key}-no`} className="cursor-pointer font-normal">
                                NO
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`${key}-obs`} className="text-sm">
                                Observação *
                              </Label>
                              <Textarea
                                id={`${key}-obs`}
                                value={response.observation}
                                onChange={(e) => handleItemChange(key, "observation", e.target.value)}
                                placeholder="Descreva a situação..."
                                rows={2}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`${key}-resp`} className="text-sm">
                                Responsável
                              </Label>
                              <Input
                                id={`${key}-resp`}
                                value={response.responsible}
                                onChange={(e) => handleItemChange(key, "responsible", e.target.value)}
                                placeholder="Nome do responsável"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm">
                              Fotos *
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {response.photoUrls.map((photoUrl, photoIdx) => (
                                <div key={photoIdx} className="relative h-24 w-24 rounded-lg border">
                                  <Image
                                    src={photoUrl || "/placeholder.svg"}
                                    alt={`Foto ${photoIdx + 1}`}
                                    fill
                                    className="rounded-lg object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                                    onClick={() => handlePhotoRemove(key, photoIdx)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                              <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handlePhotoAdd(key, file)
                                  }}
                                  disabled={uploadingPhotos[key]}
                                />
                                <Camera className="h-6 w-6 text-muted-foreground" />
                              </label>
                            </div>
                            {uploadingPhotos[key] && (
                              <p className="text-sm text-muted-foreground">Adicionando foto...</p>
                            )}
                            {response.status === "OK" && response.photoUrls.length < 2 && (
                              <p className="text-sm text-destructive">
                                Para marcar como "OK", adicione pelo menos 2 fotos (antes e depois).
                              </p>
                            )}
                            {response.status === "NO" && response.photoUrls.length < 1 && (
                              <p className="text-sm text-destructive">Adicione pelo menos 1 foto do problema.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      })()}

      <div className="flex gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Salvando..." : "Salvar Vistoria"}
        </Button>
      </div>
    </form>
  )
}
