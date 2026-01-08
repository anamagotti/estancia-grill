
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://izoekttnjmarlchfsizw.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b2VrdHRuam1hcmxjaGZzaXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzAwNDQsImV4cCI6MjA4MTkwNjA0NH0.eZy9OqdY9K6FGTaXGb-kx-BkrWdxP3mss3-S2_44k7g"
const supabase = createClient(supabaseUrl, supabaseKey)

async function removeDuplicates() {
  const { data: inspections, error } = await supabase
    .from("inspections")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching inspections:", error)
    return
  }

  const grouped = inspections.reduce((acc, curr) => {
    const key = `${curr.franchise_id}-${curr.inspection_date}-${curr.sector}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(curr)
    return acc
  }, {} as Record<string, typeof inspections>)

  for (const [key, group] of Object.entries(grouped)) {
    if (group.length > 1) {
      console.log(`Processing duplicates for ${key}...`)
      // Keep the most recent one (first in the list because of order by created_at desc)
      const toKeep = group[0]
      const toDelete = group.slice(1)

      for (const item of toDelete) {
        console.log(`Deleting duplicate ID: ${item.id}`)
        
        // Delete related photos first (if cascade delete is not set up, but usually it is or via items)
        // Actually, let's just delete the inspection and hope for cascade or handle items.
        // Ideally we should delete items first.
        
        const { data: items } = await supabase.from("checklist_items").select("id").eq("inspection_id", item.id)
        if (items && items.length > 0) {
            const itemIds = items.map(i => i.id)
            await supabase.from("checklist_item_photos").delete().in("checklist_item_id", itemIds)
            await supabase.from("checklist_items").delete().eq("inspection_id", item.id)
        }

        const { error: deleteError } = await supabase
          .from("inspections")
          .delete()
          .eq("id", item.id)

        if (deleteError) {
          console.error(`Error deleting ${item.id}:`, deleteError)
        } else {
          console.log(`Deleted ${item.id}`)
        }
      }
    }
  }
  console.log("Duplicate removal complete.")
}

removeDuplicates()
