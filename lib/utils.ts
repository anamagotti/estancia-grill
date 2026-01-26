import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateRating(percentage: number): "EXCELENTE" | "BOM" | "RUIM" {
  if (percentage >= 90) {
    return "EXCELENTE"
  } else if (percentage >= 70) {
    return "BOM"
  } else {
    return "RUIM"
  }
}

export function getRatingColor(rating: "EXCELENTE" | "BOM" | "RUIM"): string {
  switch (rating) {
    case "EXCELENTE":
      return "bg-green-500"
    case "BOM":
      return "bg-blue-500"
    case "RUIM":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}
