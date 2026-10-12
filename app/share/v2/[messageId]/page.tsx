import CodeRunner from "@/components/code-runner";
import { getPrisma } from "@/lib/prisma";
import { extractFirstCodeBlock } from "@/lib/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ messageId: string }>;
}): Promise<Metadata> {
  let { messageId } = await params;
  const message = await getMessage(messageId);
  if (!message) {
    notFound();
  }

  let title = message.chat.title;
  let searchParams = new URLSearchParams();
  searchParams.set("prompt", title);

  return {
    title,
    description: `An app generated on Xcoder: ${title}`,
    openGraph: {
      images: [`/api/og?${searchParams}`],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/api/og?${searchParams}`],
      title,
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = await params;
  const message = await getMessage(messageId);
  
  if (!message) {
    notFound();
  }

  const app = extractFirstCodeBlock(message.content);
  if (!app || !app.language) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header for shared page */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <span className="text-sm font-bold text-white">D</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">DashGen</h1>
              <p className="text-xs text-muted-foreground">Shared Dashboard</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {message.chat.title}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="h-[calc(100vh-64px)] w-full">
        <CodeRunner language={app.language} code={app.code} />
      </div>
    </div>
  );
}

const getMessage = cache(async (messageId: string) => {
  const prisma = getPrisma();
  return prisma.message.findUnique({
    where: {
      id: messageId,
    },
    include: {
      chat: true,
    },
  });
});
