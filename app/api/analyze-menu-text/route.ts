import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }

    if (!process.env.GOOGLE_API_KEY) {
        // Mock response if no API key
        return NextResponse.json({ 
            items: [
                { name: "Exemplo Prato 1", description: "Descrição do prato 1 extraída do texto." },
                { name: "Exemplo Prato 2", description: "Descrição do prato 2 extraída do texto." }
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

    for (const modelName of modelsToTry) {
        try {
            console.log(`Trying model: ${modelName} for text analysis...`);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: { responseMimeType: "application/json" }
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

    const jsonResponse = JSON.parse(responseText)
    
    // Ensure structure is correct
    if (!jsonResponse.items || !Array.isArray(jsonResponse.items)) {
         throw new Error("Invalid format returned by AI")
    }

    return NextResponse.json({ items: jsonResponse.items })
  } catch (error: any) {
    console.error("Error analyzing text:", error)
    return NextResponse.json({ error: "Failed to analyze text: " + error.message }, { status: 500 })
  }
}
