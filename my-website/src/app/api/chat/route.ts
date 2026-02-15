import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { SYSTEM_PROMPT } from "@/lib/agent-context";

// allow streaming responses up to 30s
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "invalid messages format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // convert ui messages (parts-based) to model messages (content-based)
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-4o"),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      temperature: 0.75,
      maxOutputTokens: 1000,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("chat api error:", error);
    return new Response(
      JSON.stringify({ error: "something went wrong" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
