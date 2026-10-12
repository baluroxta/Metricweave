"use client";

import { createMessage } from "@/app/(main)/actions";
import LogoSmall from "@/components/icons/logo-small";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, use, useEffect, useRef, useState } from "react";
import { ChatCompletionStream } from "together-ai/lib/ChatCompletionStream.mjs";
import ChatBox from "./chat-box";
import ChatLog from "./chat-log";
import CodeViewer from "./code-viewer";
import CodeViewerLayout from "./code-viewer-layout";
import type { Chat } from "./page";
import { Context } from "../../providers";

export default function PageClient({ chat }: { chat: Chat }) {
  const context = use(Context);
  const [streamPromise, setStreamPromise] = useState<
    Promise<ReadableStream> | undefined
  >(context.streamPromise);
  const [streamText, setStreamText] = useState("");
  const [isShowingCodeViewer, setIsShowingCodeViewer] = useState(
    chat.messages.some((m) => m.role === "assistant"),
  );
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");
  const router = useRouter();
  const isHandlingStreamRef = useRef(false);
  const [activeMessage, setActiveMessage] = useState(
    chat.messages.filter((m) => m.role === "assistant").at(-1),
  );

  useEffect(() => {
    if (!streamPromise || isHandlingStreamRef.current) return;

    isHandlingStreamRef.current = true;
    setStreamText("");
    setIsShowingCodeViewer(true);

    (async () => {
      try {
        const reader = (await streamPromise).getReader();
        const stream = ChatCompletionStream.fromReadableStream(
          new ReadableStream({
            start(controller) {
              function push() {
                reader.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  controller.enqueue(value);
                  push();
                });
              }
              push();
            },
          }),
        );

        for await (const chunk of stream) {
          if (chunk.choices[0]?.delta?.content) {
            setStreamText((prev) => prev + chunk.choices[0].delta.content);
          }
        }

        router.refresh();
      } catch (error) {
        console.error("Error reading stream:", error);
      } finally {
        isHandlingStreamRef.current = false;
        setStreamPromise(undefined);
      }
    })();
  }, [streamPromise, router]);

  return (
    <div className="h-dvh bg-background">
      <div className="flex h-full">
        <div className="mx-auto flex w-full shrink-0 flex-col overflow-hidden bg-background lg:w-1/2">
          <div className="flex items-center gap-4 px-4 py-4 border-b border-border bg-card">
            <Link href="/">
              <LogoSmall />
            </Link>
            <p className="italic text-muted-foreground">{chat.title}</p>
          </div>

          <ChatLog
            chat={chat}
            streamText={streamText}
            activeMessage={activeMessage}
            onMessageClick={(message) => {
              if (message !== activeMessage) {
                setActiveMessage(message);
                setIsShowingCodeViewer(true);
              } else {
                setActiveMessage(undefined);
                setIsShowingCodeViewer(false);
              }
            }}
          />

          <ChatBox
            chat={chat}
            onNewStreamPromise={setStreamPromise}
            isStreaming={!!streamPromise}
          />
        </div>

        <CodeViewerLayout
          isShowing={isShowingCodeViewer}
          onClose={() => setIsShowingCodeViewer(false)}
        >
          <CodeViewer
            chat={chat}
            streamText={streamText}
            message={activeMessage}
            onMessageChange={setActiveMessage}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onClose={() => setIsShowingCodeViewer(false)}
            onRequestFix={(error) => {
              startTransition(() => {
                const streamPromise = createMessage(
                  chat.id,
                  `I'm getting this error:\n\`\`\`\n${error}\n\`\`\`\n\nCan you please fix it?`,
                  "user",
                ).then((message) =>
                  fetch("/api/get-next-completion-stream-promise", {
                    method: "POST",
                    body: JSON.stringify({
                      messageId: message.id,
                      model: chat.model,
                    }),
                  }).then((res) => {
                    if (!res.body) {
                      throw new Error("No body on response");
                    }
                    return res.body;
                  }),
                );

                setStreamPromise(streamPromise);
              });
            }}
          />
        </CodeViewerLayout>
      </div>
    </div>
  );
}
