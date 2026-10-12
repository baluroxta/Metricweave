"use server";

import { getPrisma } from "@/lib/prisma";
import {
  getMainCodingPrompt,
  screenshotToCodePrompt,
  softwareArchitectPrompt,
} from "@/lib/prompts";
import { notFound } from "next/navigation";
import Together from "together-ai";
import { getRelevantPatterns, generateMemoryEnhancedPrompt, type MemoryContext } from "@/lib/memory";

export async function createChat(
  prompt: string,
  model: string,
  quality: "high" | "low",
  screenshotUrl: string | undefined,
  dataContext?: MemoryContext,
) {
  const prisma = getPrisma();
  const chat = await prisma.chat.create({
    data: {
      model,
      quality,
      prompt,
      title: "",
      shadcn: true, // Using Radix UI Themes
    },
  });

  let options: ConstructorParameters<typeof Together>[0] = {};
  if (process.env.HELICONE_API_KEY) {
    options.baseURL = "https://together.helicone.ai/v1";
    options.defaultHeaders = {
      "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
      "Helicone-Property-appname": "DashGen",
      "Helicone-Session-Id": chat.id,
      "Helicone-Session-Name": "DashGen Chat",
    };
  }

  const together = new Together(options);

  async function fetchTitle() {
    const responseForChatTitle = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a chatbot helping the user create a simple app or script, and your current job is to create a succinct title, maximum 3-5 words, for the chat given their initial prompt. Please return only the title.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const title = responseForChatTitle.choices[0].message?.content || prompt;
    return title;
  }

  async function fetchTopExample() {
    const findSimilarExamples = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful bot. Given a request for building an app, you match it to the most similar example provided. If the request is NOT similar to any of the provided examples, return "none". Here is the list of examples, ONLY reply with one of them OR "none":

          - landing page
          - blog app
          - quiz app
          - pomodoro timer
          - calculator app
          - sales dashboard
          - analytics dashboard
          - financial dashboard
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const mostSimilarExample =
      findSimilarExamples.choices[0].message?.content?.trim() || "none";
    console.log('Selected similar example:', mostSimilarExample);
    return mostSimilarExample;
  }

  const [title, rawMostSimilarExample] = await Promise.all([
    fetchTitle(),
    fetchTopExample(),
  ]);

  // Ensure we have a valid example, fallback to "none" if not recognized
  const validExamples = [
    "landing page",
    "blog app", 
    "quiz app",
    "pomodoro timer",
    "calculator app",
    "sales dashboard",
    "analytics dashboard", 
    "financial dashboard"
  ];
  
  const mostSimilarExample = validExamples.includes(rawMostSimilarExample) 
    ? rawMostSimilarExample 
    : "none";
    
  console.log('Raw example:', rawMostSimilarExample, 'Final example:', mostSimilarExample);

  let fullScreenshotDescription;
  if (screenshotUrl) {
    const screenshotResponse = await together.chat.completions.create({
      model: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
      temperature: 0.2,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: screenshotToCodePrompt },
            {
              type: "image_url",
              image_url: {
                url: screenshotUrl,
              },
            },
          ],
        },
      ],
    });

    fullScreenshotDescription = screenshotResponse.choices[0].message?.content;
  }

  let userMessage: string;
  
  // Enhance prompt with memory patterns if data context is provided
  let enhancedPrompt = prompt;
  if (dataContext) {
    try {
      const relevantPatterns = await getRelevantPatterns(dataContext);
      enhancedPrompt = generateMemoryEnhancedPrompt(prompt, relevantPatterns);
      
      // If there's a fileId, add data access instructions to the prompt
      if (dataContext.fileId) {
        enhancedPrompt += `\n\n**CRITICAL: DATA ACCESS INSTRUCTIONS**\n`;
        enhancedPrompt += `The uploaded data file is stored with ID: ${dataContext.fileId}\n`;
        enhancedPrompt += `To access the data in your dashboard, use this API endpoint: /api/import-data\n`;
        enhancedPrompt += `Example fetch: fetch('/api/import-data', { method: 'POST', body: JSON.stringify({ fileId: '${dataContext.fileId}', fileName: 'data.csv' }) })\n`;
        enhancedPrompt += `This will return the actual data that you MUST use in your dashboard.\n`;
      }
    } catch (error) {
      console.error('Error enhancing prompt with memory:', error);
      // Continue with original prompt if memory fails
    }
  }
  
  const finalPrompt = fullScreenshotDescription
    ? fullScreenshotDescription + enhancedPrompt
    : enhancedPrompt;
  
  if (quality === "high") {
    let initialRes = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: softwareArchitectPrompt,
        },
        {
          role: "user",
          content: finalPrompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    userMessage = initialRes.choices[0].message?.content ?? enhancedPrompt;
  } else if (fullScreenshotDescription) {
    userMessage =
      enhancedPrompt +
      "RECREATE THIS APP AS CLOSELY AS POSSIBLE: " +
      fullScreenshotDescription;
  } else {
    userMessage = enhancedPrompt;
  }

  let newChat = await prisma.chat.update({
    where: {
      id: chat.id,
    },
    data: {
      title,
      messages: {
        createMany: {
          data: [
            {
              role: "system",
              content: getMainCodingPrompt(mostSimilarExample),
              position: 0,
            },
            { role: "user", content: userMessage, position: 1 },
          ],
        },
      },
    },
    include: {
      messages: true,
    },
  });

  const lastMessage = newChat.messages
    .sort((a, b) => a.position - b.position)
    .at(-1);
  if (!lastMessage) throw new Error("No new message");

  return {
    chatId: chat.id,
    lastMessageId: lastMessage.id,
  };
}

export async function createMessage(
  chatId: string,
  text: string,
  role: "assistant" | "user",
) {
  const prisma = getPrisma();
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });
  if (!chat) notFound();

  const maxPosition = Math.max(...chat.messages.map((m) => m.position));

  const newMessage = await prisma.message.create({
    data: {
      role,
      content: text,
      position: maxPosition + 1,
      chatId,
    },
  });

  return newMessage;
}
