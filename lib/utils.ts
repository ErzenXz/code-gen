import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ParsedStream {
  messageId?: string;
  text: string;
  event?: {
    finishReason?: string;
    // ... other potential event properties
  };
  data?: unknown;
}

// ... existing parseCodeForgeStream function ...
export function parseCodeForgeStream(raw: string): ParsedStream {
  const parts = raw.trim().split(/\s+/);
  const result: ParsedStream = { text: "" };
  for (const part of parts) {
    if (part.startsWith("f:")) {
      // message id
      try {
        result.messageId = JSON.parse(part.slice(2)).messageId;
      } catch {}
    } else if (/^\d+:"/.test(part)) {
      // text fragment
      const idx = part.indexOf(":");
      try {
        result.text += JSON.parse(part.slice(idx + 1));
      } catch {}
    } else if (part.startsWith("e:")) {
      try {
        // Assuming event structure might vary, only parse known fields if needed
        const eventData = JSON.parse(part.slice(2));
        result.event = { finishReason: eventData.finishReason }; // Only store finishReason
      } catch {}
    } else if (part.startsWith("d:")) {
      // Keep data parsing as is, but it won't be used in cleanStreamResponse
      try {
        result.data = JSON.parse(part.slice(2));
      } catch {}
    } else {
      // plain text fragment
      result.text += part + " ";
    }
  }
  result.text = result.text.trim();
  return result;
}

export interface CleanResponse {
  text: string;
  metadata?: {
    messageId?: string;
    finishReason?: string;
    // Removed usage details
  };
}

export function cleanStreamResponse(parsedStream: ParsedStream): CleanResponse {
  // Extract basic properties
  const result: CleanResponse = {
    text: parsedStream.text,
    metadata: {},
  };

  // Extract message ID if available
  if (parsedStream.messageId) {
    result.metadata!.messageId = parsedStream.messageId;
  }

  // Extract finish reason from event data if available
  if (parsedStream.event?.finishReason) {
    result.metadata!.finishReason = parsedStream.event.finishReason;
  }
  // Removed extraction of usage details

  // Remove metadata if empty
  if (Object.keys(result.metadata!).length === 0) {
    delete result.metadata;
  }

  return result;
}
