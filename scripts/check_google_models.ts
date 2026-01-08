
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("GOOGLE_API_KEY not found in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    // There isn't a direct listModels on the client instance in some versions, 
    // but let's try to just use a known model and see if it errors, 
    // or use the model listing if available in the SDK version.
    // Actually, checking docs/types implies we might not have a listModels method exposed plainly on the main class in all versions.
    // But let's try to minimal test `gemini-1.5-flash`.

    const modelName = "gemini-1.5-flash";
    console.log(`Testing model: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log(`Success! Model ${modelName} is working.`);
    console.log("Response:", response.text());

  } catch (error: any) {
    console.error("Error testing model:", error.message);
    
    // Try fallback
    try {
        const fallback = "gemini-pro";
        console.log(`Testing fallback: ${fallback}...`);
        const model = genAI.getGenerativeModel({ model: fallback });
        await model.generateContent("Hello");
        console.log(`Success! Model ${fallback} is working.`);
    } catch(e: any) {
        console.error(`Fallback failed: ${e.message}`);
    }
  }
}

listModels();
