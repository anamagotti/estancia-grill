import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }

    // Function for basic manual parsing (fallback)
    const simpleParse = (rawText: string) => {
        const lines = rawText.split(/\n/);
        const items = lines
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith("- ")) // Basic cleanup
            .map(line => {
                // Remove bullets if present
                const name = line.replace(/^[\-\*•]\s?/, "").trim();
                return { name, description: "" };
            })
            .filter(item => item.name.length > 0);
        
        return items;
    }

    if (!process.env.GOOGLE_API_KEY) {
        console.warn("GOOGLE_API_KEY not found, performing simple parse.");
        // If no key, just parse the text manually instead of returning mock data
        // This is better for the user who just wants to import a list
        const items = simpleParse(text);
        
        if (items.length > 0) {
             return NextResponse.json({ 
                items,
                warning: "AI não configurada. Importação feita por linhas."
            }, { status: 200 })
        }

        // Only return mock if empty or explicit mock request (not implemented)
        return NextResponse.json({ 
            items: [
                { name: "Exemplo Prato 1", description: "Configure a API Key para análise inteligente." }
            ],
            mock: true, 
            warning: "GOOGLE API Key not configured"
        }, { status: 200 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    
    // Prompt to parse the text
    const prompt = `
      Analise o seguinte texto que correspode a itens de um cardápio ou lista de comidas.
      Extraia TODOS os itens encontrados e retorne um JSON com o formato:
      {
        "items": [
          { "name": "Nome do Prato", "description": "Descrição do Prato" }
        ]
      }
      Se a descrição não estiver explícita, tente inferir brevemente ou deixe vazio se for apenas uma lista simples.
      Ignore cabeçalhos irrelevantes como datas ou títulos gerais se houver, foque nos itens de comida.
      
      Texto para análise:
      ${text}
    `

    // List of models to try in order of preference/stability
    const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro"]
    
    let lastError = null;
    let responseText = null;

    try {
        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying model: ${modelName} for text analysis...`);
                
                // gemini-pro (1.0) does not support responseMimeType: "application/json"
                const generationConfig = modelName.includes("gemini-pro") && !modelName.includes("1.5") 
                    ? {} 
                    : { responseMimeType: "application/json" };

                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    generationConfig
                })

                const result = await model.generateContent(prompt)
                const response = await result.response
                responseText = response.text()
                
                if (responseText) {
                    console.log(`Success with model: ${modelName}`);
                    break;
                }
            } catch (error: any) {
                console.warn(`Model ${modelName} failed: ${error.message}`);
                lastError = error;
            }
        }
        
        if (!responseText) {
            throw new Error(`All models failed. Last error: ${lastError?.message || "Unknown error"}`)
        }

        // Clean up markdown if present (e.g. ```json ... ```)
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        const jsonResponse = JSON.parse(cleanedText)
        
        // Ensure structure is correct
        if (!jsonResponse.items || !Array.isArray(jsonResponse.items)) {
            throw new Error("Invalid format returned by AI: items array missing")
        }

        return NextResponse.json({ items: jsonResponse.items })

    } catch (aiError: any) {
        console.error("AI Analysis failed, falling back to simple parse:", aiError);
        // Fallback to simple parsing
        const simplifiedItems = simpleParse(text);
        
        return NextResponse.json({ 
            items: simplifiedItems,
            warning: "Falha na IA. Importação simplificada realizada."
        }, { status: 200 }); // Return 200 so the client accepts it
    }
  } catch (error: any) {
    console.error("Error analyzing text:", error)
    return NextResponse.json({ error: "Failed to analyze text: " + error.message }, { status: 500 })
  }
}
