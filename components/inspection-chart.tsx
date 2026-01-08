"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

type Props = {
  excelent: number
  good: number
  bad: number
}

export default function InspectionChart({ excelent, good, bad }: Props) {
  const data = [
    { name: "Excelente", value: excelent, color: "#22c55e" },
    { name: "Bom", value: good, color: "#3b82f6" },
    { name: "Muito Ruim", value: bad, color: "#ef4444" },
  ].filter((item) => item.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        Nenhuma vistoria encontrada
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
