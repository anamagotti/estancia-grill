import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }

    if (!process.env.GOOGLE_API_KEY) {
        return NextResponse.json({ 
            name: "Prato da Estancia (Demo)",
            description: "Este é um texto de exemplo. Para usar a IA real, adicione sua chave API GOOGLE no arquivo .env.local.",
            mock: true, 
            warning: "GOOGLE API Key not configured"
        }, { status: 200 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    
    // Extract base64 from data URL
    const base64Data = image.split(",")[1]
    const mimeType = image.split(";")[0].split(":")[1]

    const prompt = "Analise esta imagem de comida. Identifique o nome provável do prato e uma breve descrição apetitosa (maximo 2 frases). Retorne um JSON com os campos 'name' e 'description'. Se houver múltiplas comidas, identifique a principal."

    // List of models to try in order of preference/stability
    const modelsToTry = ["gemini-flash-latest", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-pro"]
    
    let lastError = null;
    let text = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Trying model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: { responseMimeType: "application/json" }
            })

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                }
            ])

            const response = await result.response
            text = response.text()
            
            if (text) {
                console.log(`Success with model: ${modelName}`);
                break; // Exit loop on success
            }
        } catch (error: any) {
            console.warn(`Model ${modelName} failed: ${error.message}`);
            lastError = error;
            // Continue to next model
        }
    }
    
    if (!text) {
        throw new Error(`All models failed. Last error: ${lastError?.message || "Unknown error"}`)
    }

    const { name, description } = JSON.parse(text)

    return NextResponse.json({ name, description })
  } catch (error: any) {
    console.error("Error analyzing image:", error)
    return NextResponse.json({ error: "Failed to analyze image: " + error.message }, { status: 500 })
  }
}
