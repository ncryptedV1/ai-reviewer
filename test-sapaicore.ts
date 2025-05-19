import { z } from "zod";
import dotenv from "dotenv";
import { runPrompt } from "./src/ai";

// Load environment variables
dotenv.config();

// Check required environment variables
const requiredEnvVars = [
  "SAP_AI_CORE_CLIENT_ID",
  "SAP_AI_CORE_CLIENT_SECRET",
  "SAP_AI_CORE_TOKEN_URL",
  "SAP_AI_CORE_BASE_URL",
  "LLM_MODEL",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} environment variable is not set`);
    process.exit(1);
  }
}

// Set LLM_PROVIDER to use SAP AI Core
process.env.LLM_PROVIDER = "sap-ai-sdk";

// Define a simple schema for the response
const responseSchema = z.object({
  answer: z.string(),
  confidence: z.number().optional(),
});

async function main() {
  try {
    console.log("Running inference with SAP AI Core provider...");
    console.log(`Model: ${process.env.LLM_MODEL}`);
    
    const result = await runPrompt({
      prompt: "What is the capital of France? Return the answer as JSON with an 'answer' field.",
      systemPrompt: "You are a helpful assistant that responds in JSON format.",
      schema: responseSchema,
    });
    
    console.log("Inference result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error running inference:", error);
    if (error instanceof Error) {
      console.error(error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }
}

main();
