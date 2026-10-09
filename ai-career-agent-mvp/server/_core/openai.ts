import { GoogleGenAI } from "@google/genai";
import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const isAiEnabled = Boolean(process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy",
});

export async function generateStructured<T extends z.ZodTypeAny>(params: {
  systemPrompt: string;
  userPrompt: string;
  schema: T;
  schemaName: string;
  schemaDescription: string;
}): Promise<z.infer<T>> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI_DISABLED");
  }

  const jsonSchema = zodToJsonSchema(params.schema as any, { name: params.schemaName });
  const schemaForGemini = (jsonSchema as any).definitions?.[params.schemaName] ?? jsonSchema;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: `${params.systemPrompt}\n\n${params.userPrompt}` },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: schemaForGemini,
    },
  });

  const text = response.text ?? "";
  try {
    const jsonText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(jsonText) as z.infer<T>;
  } catch {
    throw new Error(`Failed to parse Gemini response as JSON: ${text.substring(0, 200)}`);
  }
}
