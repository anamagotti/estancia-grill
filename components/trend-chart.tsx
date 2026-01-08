"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

type Props = {
  inspections: Array<{
    id: string
    inspection_date: string
    percentage: number
    sector: string
  }>
}

export default function TrendChart({ inspections }: Props) {
  // Pegar últimas 30 vistorias e ordenar por data
  const chartData = inspections
    .slice(0, 30)
    .reverse()
    .map((inspection) => ({
      date: new Date(inspection.inspection_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      score: Math.round(inspection.percentage * 10) / 10,
      sector: inspection.sector,
    }))

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">Nenhum dado disponível</div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
        <Line type="monotone" dataKey="score" stroke="#f97316" strokeWidth={2} name="Pontuação (%)" />
      </LineChart>
    </ResponsiveContainer>
  )
}
