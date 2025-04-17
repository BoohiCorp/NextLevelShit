import { google } from "@ai-sdk/google";
import { jsonSchema, streamText } from "ai";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system, tools } = await req.json();

  const result = streamText({
    model: google("gemini-2.0-flash"),
    messages,
    // forward system prompt and tools from the frontend
    system,
    tools: Object.fromEntries(
      Object.entries<{ parameters: unknown }>(tools).map(([name, tool]) => [
        name,
        {
          parameters: jsonSchema(tool.parameters),
        },
      ]),
    ),
  });

  return result.toDataStreamResponse();
}
