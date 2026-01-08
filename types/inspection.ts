export type InspectionStatus = "OK" | "NO"

export type ChecklistItemResponse = {
  id?: string
  category: string
  item_name: string
  status: InspectionStatus
  points: number
  observation?: string
  responsible?: string
  photo_url?: string
  photos?: string[]
}

export type InspectionFormData = {
  franchise_id: string
  inspection_date: string
  sector: string
  items: ChecklistItemResponse[]
}

export type Franchise = {
  id: string
  name: string
  location: string
}
