import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
        return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: items, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: true })

    if (error) throw error

    // Group items by category
    const categorizedItems: Record<string, typeof items> = {
        'Buffet': [],
        'Sushi': [],
        'Churrasco': [],
        'Sobremesa': []
    }

    items?.forEach(item => {
        // If category exists in our map, add it. If not (maybe old data), add to array if we want specific handling or ignore.
        // We will default to adding if key exists.
        if (categorizedItems[item.category]) {
            categorizedItems[item.category].push(item)
        } else if (!categorizedItems[item.category]) {
             // Fallback for potentially old categories, push to array if we want to show everything
             // For now, let's just stick to the defined structure.
        }
    })

    // Format date for display
    const dateObj = new Date(date + 'T00:00:00')
    const formattedDate = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const formattedDateTitle = dateObj.toLocaleDateString('pt-BR').replace(/\//g, '-')

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Cardápio - ${formattedDate}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
          
          body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            background: #fff;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
          }

          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #f97316;
            padding-bottom: 20px;
          }

          .header h1 {
            color: #ea580c;
            margin: 0;
            font-size: 32px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }

          .header p {
            font-size: 18px;
            color: #555;
            margin-top: 10px;
            font-style: italic;
          }

          .category-section {
            margin-bottom: 40px;
            /* page-break-inside: avoid; removed to fix huge blank spaces */
          }

          .category-title {
            font-size: 24px;
            color: #c2410c;
            border-bottom: 1px solid #fed7aa;
            padding-bottom: 8px;
            margin-bottom: 20px;
            text-transform: uppercase;
            font-weight: bold;
            page-break-after: avoid; /* Keep title with at least one item */
          }
            border-bottom: 1px solid #fed7aa;
            padding-bottom: 8px;
            margin-bottom: 20px;
            text-transform: uppercase;
            font-weight: bold;
          }

          .menu-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .menu-item {
            display: flex;
            align-items: start;
            gap: 15px;
            margin-bottom: 20px;
            background: #fff7ed;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #ffedd5;
          }

          .menu-item img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 6px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .menu-item-content {
            flex: 1;
          }

          .menu-item h3 {
            margin: 0 0 5px 0;
            color: #9a3412;
            font-size: 18px;
          }

          .menu-item p {
            margin: 0;
            font-size: 14px;
            color: #666;
            line-height: 1.4;
          }

          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }

          @media print {
            body { 
              padding: 0; 
              background: white;
            }
            .container {
              padding: 0;
              max-width: 100%;
            }
            .menu-item {
              break-inside: avoid;
              border: 1px solid #ddd; /* Better contrast for print */
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Estância Grill</h1>
            <p>Cardápio do Dia - ${formattedDate}</p>
          </div>

          ${['Buffet', 'Sushi', 'Churrasco', 'Sobremesa'].map(categoryKey => {
            const catItems = categorizedItems[categoryKey] || [];
            if (catItems.length === 0) return '';
            
            if (categoryKey === 'Churrasco') {
                const subcats = ['Pré-assada', 'In natura', 'Sobra'];
                const groupedSub = subcats.map(sub => ({
                    sub,
                    items: catItems.filter((i: any) => i.subcategory === sub)
                })).filter(g => g.items.length > 0);

                // Items without subcategory or invalid subcategory in Churrasco
                const otherItems = catItems.filter((i: any) => !i.subcategory || !subcats.includes(i.subcategory));
                if (otherItems.length > 0) {
                    groupedSub.push({ sub: 'Outros', items: otherItems });
                }

                if (groupedSub.length === 0) return '';

                return `
                    <div class="category-section">
                        <div class="category-title">Churrasco</div>
                        ${groupedSub.map(group => `
                             <div style="margin-left: 0; margin-bottom: 20px;">
                                <h3 style="color: #c2410c; font-size: 18px; border-bottom: 1px dashed #fed7aa; padding-bottom: 4px; margin-bottom: 12px; margin-top: 10px; font-weight: normal; text-transform: uppercase;">
                                    ${group.sub}
                                </h3>
                                <div class="menu-grid">
                                    ${group.items.map((item: any) => `
                                        <div class="menu-item">
                                        ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" />` : ''}
                                        <div class="menu-item-content">
                                            <h3>${item.name}</h3>
                                            ${item.description ? `<p>${item.description}</p>` : ''}
                                        </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            return `
              <div class="category-section">
                <div class="category-title">${categoryKey}</div>
                <div class="menu-grid">
                  ${catItems.map((item: any) => `
                    <div class="menu-item">
                      ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" />` : ''}
                      <div class="menu-item-content">
                        <h3>${item.name}</h3>
                        ${item.description ? `<p>${item.description}</p>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}

          <div class="footer">
            <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <script>
            window.onload = function() {
                window.print();
            }
        </script>
      </body>
      </html>
    `

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Error generating menu PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
