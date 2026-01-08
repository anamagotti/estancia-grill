"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

type Props = {
  franchises: Array<{ id: string; name: string }>
  initialParams: {
    sector?: string
    franchise?: string
    rating?: string
    date_from?: string
    date_to?: string
  }
}

export default function HistorySearch({ franchises, initialParams }: Props) {
  const router = useRouter()
  const [sector, setSector] = useState(initialParams.sector || "all")
  const [franchise, setFranchise] = useState(initialParams.franchise || "all")
  const [rating, setRating] = useState(initialParams.rating || "all")
  const [dateFrom, setDateFrom] = useState(initialParams.date_from || "")
  const [dateTo, setDateTo] = useState(initialParams.date_to || "")

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (sector !== "all") params.set("sector", sector)
    if (franchise !== "all") params.set("franchise", franchise)
    if (rating !== "all") params.set("rating", rating)
    if (dateFrom) params.set("date_from", dateFrom)
    if (dateTo) params.set("date_to", dateTo)

    router.push(`/dashboard/history?${params.toString()}`)
  }

  const handleClear = () => {
    setSector("all")
    setFranchise("all")
    setRating("all")
    setDateFrom("")
    setDateTo("")
    router.push("/dashboard/history")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros de Busca</CardTitle>
        <CardDescription>Refine sua busca por setor, franquia, avaliação ou data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="sector">Setor</Label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger id="sector">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="atendimento">Atendimento</SelectItem>
                <SelectItem value="chopp">Chopp</SelectItem>
                <SelectItem value="cozinha">Cozinha</SelectItem>
                <SelectItem value="medias">Médias dos Preparos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="franchise">Franquia</Label>
            <Select value={franchise} onValueChange={setFranchise}>
              <SelectTrigger id="franchise">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {franchises.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Avaliação</Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger id="rating">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="EXCELENTE">Excelente</SelectItem>
                <SelectItem value="BOM">Bom</SelectItem>
                <SelectItem value="MUITO RUIM">Muito Ruim</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFrom">Data Inicial</Label>
            <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateTo">Data Final</Label>
            <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
          <Button onClick={handleClear} variant="outline">
            <X className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
