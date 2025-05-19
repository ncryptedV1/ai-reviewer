import { z } from "zod";
import dotenv from "dotenv";
import { runPrompt } from "./src/ai";
import { parseArgs } from "node:util";

// Load environment variables
dotenv.config();

// Parse command line arguments
const { values } = parseArgs({
  options: {
    model: {
      type: "string",
      short: "m",
      default: process.env.LLM_MODEL,
    },
    prompt: {
      type: "string",
      short: "p",
      default: "What is the capital of France? Return the answer as JSON with an 'answer' field.",
    },
    systemPrompt: {
      type: "string",
      short: "s",
      default: "You are a helpful assistant that responds in JSON format.",
    },
    temperature: {
      type: "string",
      short: "t",
      default: "0",
    },
    debug: {
      type: "boolean",
      short: "d",
      default: false,
    },
    help: {
      type: "boolean",
      short: "h",
      default: false,
    },
  },
});

// Show help if requested
if (values.help) {
  console.log(`
Usage: npx ts-node test-sapaicore-advanced.ts [options]

Options:
  -m, --model <model>            Model to use (default: from .env LLM_MODEL)
  -p, --prompt <prompt>          Prompt to send to the model
  -s, --systemPrompt <prompt>    System prompt to use
  -t, --temperature <temp>       Temperature setting (0-1)
  -d, --debug                    Enable debug mode
  -h, --help                     Show this help message

Examples:
  npx ts-node test-sapaicore-advanced.ts --model anthropic--claude-3-sonnet
  npx ts-node test-sapaicore-advanced.ts --prompt "Explain quantum computing" --systemPrompt "You are a physics expert"
  `);
  process.exit(0);
}

// Check required environment variables
const requiredEnvVars = [
  "SAP_AI_CORE_CLIENT_ID",
  "SAP_AI_CORE_CLIENT_SECRET",
  "SAP_AI_CORE_TOKEN_URL",
  "SAP_AI_CORE_BASE_URL",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} environment variable is not set`);
    process.exit(1);
  }
}

// Set model from command line or environment
if (!values.model) {
  console.error("Error: No model specified. Use --model flag or set LLM_MODEL in .env");
  process.exit(1);
}

// Set LLM_PROVIDER to use SAP AI Core
process.env.LLM_PROVIDER = "sap-ai-sdk";
process.env.LLM_MODEL = values.model as string;

// Enable debug mode if requested
if (values.debug) {
  process.env.DEBUG = "true";
}

// Define a flexible schema for the response
// This will accept any JSON object with at least one property
const responseSchema = z.object({}).catchall(z.unknown());

async function main() {
  try {
    console.log("Running inference with SAP AI Core provider...");
    console.log(`Model: ${process.env.LLM_MODEL}`);
    console.log(`Prompt: ${values.prompt}`);
    console.log(`System Prompt: ${values.systemPrompt}`);
    console.log(`Temperature: ${values.temperature}`);
    console.log("---");
    
    const startTime = Date.now();
    
    const result = await runPrompt({
      prompt: values.prompt as string,
      systemPrompt: values.systemPrompt as string,
      schema: responseSchema,
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log("---");
    console.log(`Inference completed in ${duration.toFixed(2)} seconds`);
    console.log("Result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error running inference:");
    if (error instanceof Error) {
      console.error(error.message);
      if (error.stack && values.debug) {
        console.error(error.stack);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
