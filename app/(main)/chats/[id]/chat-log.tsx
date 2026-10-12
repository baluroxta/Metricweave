"use client";

import type { Chat, Message } from "./page";
import ArrowLeftIcon from "@/components/icons/arrow-left";
import { splitByFirstCodeFence } from "@/lib/utils";
import { Fragment } from "react";
import Markdown from "react-markdown";
import { StickToBottom } from "use-stick-to-bottom";

export default function ChatLog({
  chat,
  activeMessage,
  streamText,
  onMessageClick,
}: {
  chat: Chat;
  activeMessage?: Message;
  streamText: string;
  onMessageClick: (v: Message) => void;
}) {
  const assistantMessages = chat.messages.filter((m) => m.role === "assistant");

  return (
    <StickToBottom
      className="relative grow overflow-hidden"
      resize="smooth"
      initial="smooth"
    >
      <StickToBottom.Content className="mx-auto flex w-full max-w-prose flex-col gap-4 p-6">
        <UserMessage content={chat.prompt} />

        {chat.messages.slice(2).map((message) => (
          <Fragment key={message.id}>
            {message.role === "user" ? (
              <UserMessage content={message.content} />
            ) : (
              <AssistantMessage
                content={message.content}
                version={
                  assistantMessages.map((m) => m.id).indexOf(message.id) + 1
                }
                message={message}
                isActive={!streamText && activeMessage?.id === message.id}
                onMessageClick={onMessageClick}
              />
            )}
          </Fragment>
        ))}

        {streamText && (
          <AssistantMessage
            content={streamText}
            version={assistantMessages.length + 1}
            isActive={true}
          />
        )}
      </StickToBottom.Content>
    </StickToBottom>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="relative inline-flex max-w-[80%] items-end gap-3 self-end">
      <div className="whitespace-pre-wrap rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white shadow-md dark:from-blue-500 dark:to-purple-500">
        {content}
      </div>
    </div>
  );
}

function AssistantMessage({
  content,
  version,
  message,
  isActive,
  onMessageClick = () => {},
}: {
  content: string;
  version: number;
  message?: Message;
  isActive?: boolean;
  onMessageClick?: (v: Message) => void;
}) {
  const parts = splitByFirstCodeFence(content);

  function toTitleCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div className="relative inline-flex max-w-[100%] items-start gap-3 self-start">
      <div className="whitespace-pre-wrap rounded bg-card border border-border px-4 py-2 text-card-foreground shadow-md">
        {parts.map((part, index) => (
          <div key={index}>
            {part.type === "text" && (
              <Markdown className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground prose-p:my-2 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                {part.content}
              </Markdown>
            )}
            {(part.type === "first-code-fence" ||
              part.type === "first-code-fence-generating") && (
              message ? (
                <div className="my-4">
                  <button
                    className={`${
                      isActive 
                        ? "bg-accent border-primary shadow-md" 
                        : "bg-secondary border-border hover:border-primary hover:bg-accent"
                    } inline-flex w-full items-center gap-2 rounded-lg border-2 p-1.5 transition-all`}
                    onClick={() => onMessageClick(message)}
                  >
                    <div
                      className={`${
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      } flex size-8 items-center justify-center rounded font-bold transition-colors`}
                    >
                      V{version}
                    </div>
                    <div className="flex flex-col gap-0.5 text-left leading-none">
                      <div className="text-sm font-medium leading-none text-foreground">
                        {toTitleCase(part.filename.name)}{" "}
                        {version !== 1 && `v${version}`}
                      </div>
                      <div className="text-xs leading-none text-muted-foreground">
                        {part.filename.name}
                        {version !== 1 && `-v${version}`}
                        {"."}
                        {part.filename.extension}
                      </div>
                    </div>
                    <div className="ml-auto text-muted-foreground">
                      <ArrowLeftIcon />
                    </div>
                  </button>
                </div>
              ) : (
                <div className="my-4">
                  <button
                    className="inline-flex w-full items-center gap-2 rounded-lg border-2 border-border bg-muted p-1.5 opacity-75"
                    disabled
                  >
                    <div className="flex size-8 items-center justify-center rounded bg-muted-foreground/20 text-muted-foreground font-bold">
                      V{version}
                    </div>
                    <div className="flex flex-col gap-0.5 text-left leading-none">
                      <div className="text-sm font-medium leading-none text-muted-foreground">
                        {toTitleCase(part.filename.name)}{" "}
                        {version !== 1 && `v${version}`}
                      </div>
                      <div className="text-xs leading-none text-muted-foreground/70">
                        {part.filename.name}
                        {version !== 1 && `-v${version}`}
                        {"."}
                        {part.filename.extension}
                      </div>
                    </div>
                    <div className="ml-auto text-muted-foreground/50">
                      <ArrowLeftIcon />
                    </div>
                  </button>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
