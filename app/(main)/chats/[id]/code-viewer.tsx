"use client";

import ChevronLeftIcon from "@/components/icons/chevron-left";
import ChevronRightIcon from "@/components/icons/chevron-right";
import CloseIcon from "@/components/icons/close-icon";
import RefreshIcon from "@/components/icons/refresh";
import { extractFirstCodeBlock, splitByFirstCodeFence } from "@/lib/utils";
import { useState } from "react";
import type { Chat, Message } from "./page";
import { Share } from "./share";
import { StickToBottom } from "use-stick-to-bottom";
import dynamic from "next/dynamic";

const CodeRunner = dynamic(() => import("@/components/code-runner"), {
  ssr: false,
});
const SyntaxHighlighter = dynamic(
  () => import("@/components/syntax-highlighter"),
  {
    ssr: false,
  },
);

export default function CodeViewer({
  chat,
  streamText,
  message,
  onMessageChange,
  activeTab,
  onTabChange,
  onClose,
  onRequestFix,
}: {
  chat: Chat;
  streamText: string;
  message?: Message;
  onMessageChange: (v: Message) => void;
  activeTab: string;
  onTabChange: (v: "code" | "preview") => void;
  onClose: () => void;
  onRequestFix: (e: string) => void;
}) {
  const app = message ? extractFirstCodeBlock(message.content) : undefined;
  const streamAppParts = splitByFirstCodeFence(streamText);
  const streamApp = streamAppParts.find(
    (p) =>
      p.type === "first-code-fence-generating" || p.type === "first-code-fence",
  );

  const code = streamApp ? streamApp.content : app?.code || "";
  const language = streamApp ? streamApp.language : app?.language || "";
  const title = streamApp ? streamApp.filename.name : app?.filename?.name || "";
  const layout = ["python", "ts", "js", "javascript", "typescript"].includes(
    language,
  )
    ? "two-up"
    : "tabbed";

  const assistantMessages = chat.messages.filter((m) => m.role === "assistant");
  const currentVersion = streamApp
    ? assistantMessages.length
    : message
      ? assistantMessages.map((m) => m.id).indexOf(message.id)
      : 1;
  const previousMessage =
    currentVersion !== 0 ? assistantMessages.at(currentVersion - 1) : undefined;
  const nextMessage =
    currentVersion < assistantMessages.length
      ? assistantMessages.at(currentVersion + 1)
      : undefined;

  const [refresh, setRefresh] = useState(0);

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-sm px-4">
        <div className="inline-flex items-center gap-4">
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={onClose}
          >
            <CloseIcon className="size-5" />
          </button>
          <span className="text-foreground font-medium">
            {title}{" "}
            <span className="ml-2 px-2 py-1 text-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20">
              v{currentVersion + 1}
            </span>
          </span>
        </div>
        {layout === "tabbed" && (
          <div className="rounded-lg border border-border/50 bg-muted/30 p-1 backdrop-blur-sm">
            <button
              onClick={() => onTabChange("code")}
              data-active={activeTab === "code" ? true : undefined}
              className="inline-flex h-8 w-20 items-center justify-center rounded-md text-sm font-medium text-muted-foreground data-[active]:bg-gradient-to-r data-[active]:from-blue-500 data-[active]:to-purple-500 data-[active]:text-white data-[active]:shadow-md transition-all duration-200"
            >
              Code
            </button>
            <button
              onClick={() => onTabChange("preview")}
              data-active={activeTab === "preview" ? true : undefined}
              className="inline-flex h-8 w-20 items-center justify-center rounded-md text-sm font-medium text-muted-foreground data-[active]:bg-gradient-to-r data-[active]:from-blue-500 data-[active]:to-purple-500 data-[active]:text-white data-[active]:shadow-md transition-all duration-200"
            >
              Preview
            </button>
          </div>
        )}
      </div>

      <div className="flex h-0 grow">
        {layout === "two-up" ? (
          <>
            <div className="flex w-1/2 flex-col">
              <div className="border-b border-border bg-muted px-4 py-2">
                <h3 className="text-sm font-medium text-foreground">Code</h3>
              </div>
              <div className="grow overflow-y-auto bg-background">
                <SyntaxHighlighter code={code} language={language} />
              </div>
            </div>
            <div className="w-1/2 border-l border-border">
              <div className="border-b border-border bg-muted px-4 py-2">
                <h3 className="text-sm font-medium text-foreground">Preview</h3>
              </div>
              <div className="h-full bg-background">
                <CodeRunner
                  key={refresh}
                  language={language}
                  code={code}
                  onRequestFix={onRequestFix}
                />
              </div>
            </div>
          </>
        ) : (
          <StickToBottom
            className="w-full"
            resize="smooth"
            initial="smooth"
          >
            <StickToBottom.Content className="h-full">
              {activeTab === "code" ? (
                <div className="h-full overflow-y-auto bg-background">
                  <SyntaxHighlighter code={code} language={language} />
                </div>
              ) : (
                <div className="h-full bg-background">
                  <CodeRunner
                    key={refresh}
                    language={language}
                    code={code}
                    onRequestFix={onRequestFix}
                  />
                </div>
              )}
            </StickToBottom.Content>
          </StickToBottom>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border bg-card px-4 py-4">
        <div className="inline-flex items-center gap-2.5 text-sm">
          <Share message={message && !streamApp ? message : undefined} />
          <button
            className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-sm text-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            onClick={() => setRefresh((r) => r + 1)}
          >
            <RefreshIcon className="size-3" />
            Refresh
          </button>
        </div>
        <div className="flex items-center justify-end gap-3">
          {previousMessage ? (
            <button
              className="text-foreground hover:text-primary transition-colors"
              onClick={() => onMessageChange(previousMessage)}
            >
              <ChevronLeftIcon className="size-4" />
            </button>
          ) : (
            <button className="text-muted-foreground opacity-25" disabled>
              <ChevronLeftIcon className="size-4" />
            </button>
          )}

          <p className="text-sm text-foreground">
            Version <span className="tabular-nums">{currentVersion + 1}</span>{" "}
            <span className="text-muted-foreground">of</span>{" "}
            <span className="tabular-nums">
              {Math.max(currentVersion + 1, assistantMessages.length)}
            </span>
          </p>

          {nextMessage ? (
            <button
              className="text-foreground hover:text-primary transition-colors"
              onClick={() => onMessageChange(nextMessage)}
            >
              <ChevronRightIcon className="size-4" />
            </button>
          ) : (
            <button className="text-muted-foreground opacity-25" disabled>
              <ChevronRightIcon className="size-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
