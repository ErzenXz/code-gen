import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge";

// Define the type for the API request
interface AgentRequest {
  prompt: string;
}

export async function POST(req: Request) {
  try {
    // Parse request body
    const { prompt } = (await req.json()) as AgentRequest;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Stream AI response using Vercel AI SDK
    const stream = streamText({ model: openai("gpt-4.1-mini"), prompt });
    return stream.toDataStreamResponse();
  } catch (error) {
    console.error("Error processing agent request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
