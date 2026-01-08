
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://izoekttnjmarlchfsizw.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b2VrdHRuam1hcmxjaGZzaXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzAwNDQsImV4cCI6MjA4MTkwNjA0NH0.eZy9OqdY9K6FGTaXGb-kx-BkrWdxP3mss3-S2_44k7g"
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDuplicates() {
  const { data: inspections, error } = await supabase
    .from("inspections")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching inspections:", error)
    return
  }

  console.log(`Found ${inspections.length} inspections.`)

  const grouped = inspections.reduce((acc, curr) => {
    const key = `${curr.franchise_id}-${curr.inspection_date}-${curr.sector}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(curr)
    return acc
  }, {} as Record<string, typeof inspections>)

  let duplicatesFound = false
  for (const [key, group] of Object.entries(grouped)) {
    if (group.length > 1) {
      duplicatesFound = true
      console.log(`Duplicate found for ${key}: ${group.length} entries`)
      group.forEach(i => console.log(` - ID: ${i.id}, Created At: ${i.created_at}, Points: ${i.points_achieved}/${i.total_points}`))
    }
  }

  if (!duplicatesFound) {
    console.log("No duplicates found.")
  }
}

checkDuplicates()
