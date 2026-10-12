import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import { z } from "zod";
import Together from "together-ai";
import { getMainCodingPrompt } from "@/lib/prompts";
import { extractFirstCodeBlock } from "@/lib/utils";
import { detectFollowUpIntent, generateFollowUpInstructions } from "@/lib/follow-up-helpers";

export async function POST(req: Request) {
  const neon = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(neon);
  const prisma = new PrismaClient({ adapter });
  const { messageId, model } = await req.json();

  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    return new Response(null, { status: 404 });
  }

  const messagesRes = await prisma.message.findMany({
    where: { chatId: message.chatId, position: { lte: message.position } },
    orderBy: { position: "asc" },
  });

  let messages = z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
      }),
    )
    .parse(messagesRes);

  // Detect if this is a follow-up request (more than 2 messages means follow-up)
  const isFollowUp = messages.length > 2;
  let existingCode: string | undefined;

  if (isFollowUp) {
    // Find the most recent assistant message with code
    const assistantMessages = messages.filter(m => m.role === "assistant");
    const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
    
    if (lastAssistantMessage) {
      const codeBlock = extractFirstCodeBlock(lastAssistantMessage.content);
      if (codeBlock) {
        existingCode = codeBlock.code;
        console.log('Follow-up detected, extracted existing code length:', existingCode.length);
      }
    }

    // Analyze the user's current request for follow-up intent
    const currentUserMessage = messages[messages.length - 1];
    if (currentUserMessage.role === "user" && existingCode) {
      const followUpAnalysis = detectFollowUpIntent(currentUserMessage.content);
      console.log('Follow-up analysis:', followUpAnalysis);
      
      if (followUpAnalysis.isFollowUp && followUpAnalysis.confidence > 0.3) {
        // Generate specific follow-up instructions
        const followUpInstructions = generateFollowUpInstructions(
          followUpAnalysis.intent, 
          currentUserMessage.content
        );
        
        // Update the system message with enhanced follow-up context
        if (messages[0].role === "system") {
          messages[0].content = getMainCodingPrompt("none", true, existingCode) + 
            `\n\n${followUpInstructions}`;
        }
      }
    } else if (existingCode && messages[0].role === "system") {
      // Fallback to basic follow-up mode
      messages[0].content = getMainCodingPrompt("none", true, existingCode);
    }
  }

  if (messages.length > 10) {
    messages = [messages[0], messages[1], messages[2], ...messages.slice(-7)];
  }

  let options: ConstructorParameters<typeof Together>[0] = {};
  if (process.env.HELICONE_API_KEY) {
    options.baseURL = "https://together.helicone.ai/v1";
    options.defaultHeaders = {
      "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
      "Helicone-Property-appname": "DashGen",
      "Helicone-Session-Id": message.chatId,
      "Helicone-Session-Name": "DashGen Chat",
    };
  }

  const together = new Together(options);

  try {
    const res = await together.chat.completions.create({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
      temperature: 0.2,
      max_tokens: 9000,
      stop: ["<|eot_id|>", "<|end_of_text|>"], // Add stop tokens to prevent incomplete responses
    });

    return new Response(res.toReadableStream());
  } catch (error) {
    console.error('Together AI streaming error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create completion stream' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Using Node.js runtime instead of Edge to avoid size limits (Edge limit is 1MB)
export const runtime = "nodejs";
export const maxDuration = 60;
