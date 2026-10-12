"use client";

import ArrowRightIcon from "@/components/icons/arrow-right";
import Spinner from "@/components/spinner";
import { useState, useTransition } from "react";
import { createMessage } from "../../actions";
import type { Chat } from "./page";

export default function ChatBox({
  chat,
  onNewStreamPromise,
  isStreaming,
}: {
  chat: Chat;
  onNewStreamPromise: (v: Promise<ReadableStream>) => void;
  isStreaming: boolean;
}) {
  const [message, setMessage] = useState("");
  const [disabled, startTransition] = useTransition();

  const textareaResizeMessage = message
    .split("\n")
    .map((text) => (text === "" ? "a" : text))
    .join("\n");

  return (
    <div className="w-full px-4 pb-4">
      <form
        action={async (formData) => {
          startTransition(async () => {
            const messageContent = String(formData.get("message"));

            const newMessage = await createMessage(chat.id, messageContent, "user");

            const streamPromise = fetch(
              "/api/get-next-completion-stream-promise",
              {
                method: "POST",
                body: JSON.stringify({
                  messageId: newMessage.id,
                  model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
                }),
              },
            ).then((res) => {
              if (!res.body) {
                throw new Error("No body on response");
              }
              return res.body;
            });

            onNewStreamPromise(streamPromise);
            setMessage("");
          });
        }}
      >
        <fieldset disabled={disabled || isStreaming}>
          <div className="relative flex w-full rounded-lg border-2 border-border bg-card/90 backdrop-blur-sm pb-8">
            <div className="w-full">
              <div className="relative">
                <div className="p-3">
                  <p className="invisible w-full whitespace-pre-wrap text-foreground">
                    {textareaResizeMessage}
                  </p>
                </div>
                <textarea
                  placeholder="Add features (table, charts), modify styling, or ask questions..."
                  required
                  name="message"
                  rows={1}
                  className="peer absolute inset-0 w-full resize-none bg-transparent p-3 placeholder-muted-foreground text-foreground focus-visible:outline-none disabled:opacity-50"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      const target = event.target;
                      if (!(target instanceof HTMLTextAreaElement)) return;
                      target.closest("form")?.requestSubmit();
                    }
                  }}
                />
              </div>
            </div>

            <div className="absolute bottom-1.5 right-1.5 flex has-[:disabled]:opacity-50">
              <div className="pointer-events-none absolute inset-0 -bottom-[1px] rounded-lg bg-gradient-to-r from-blue-600 to-purple-600" />

              <button
                className="relative inline-flex size-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 font-medium text-white shadow-lg hover:from-blue-700 hover:to-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-all duration-200 hover:shadow-xl hover:scale-105"
                type="submit"
              >
                <Spinner loading={disabled}>
                  <ArrowRightIcon className="w-4 h-4" />
                </Spinner>
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
