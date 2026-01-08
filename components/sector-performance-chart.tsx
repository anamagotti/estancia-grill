"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

type Props = {
  data: Record<string, { total: number; sum: number; count: number }>
}

const SECTOR_NAMES: Record<string, string> = {
  atendimento: "Atendimento",
  chopp: "Chopp",
  cozinha: "Cozinha",
  medias: "Médias",
}

export default function SectorPerformanceChart({ data }: Props) {
  const chartData = Object.entries(data).map(([sector, stats]) => ({
    name: SECTOR_NAMES[sector] || sector,
    value: Math.round(stats.total * 10) / 10,
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">Nenhum dado disponível</div>
    )
  }

  const getColor = (value: number) => {
    if (value >= 92.6) return "#22c55e"
    if (value >= 72.8) return "#3b82f6"
    return "#ef4444"
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip formatter={(value) => `${value}%`} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
