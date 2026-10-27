"use client";

import { useRef } from "react";
import ReactMarkdown from "react-markdown";
import TypingIndicator from "../TypingIndicator";

const BUBBLE_STYLES = {
  user: "self-end bg-primary text-white",
  bot: "self-start border border-primary/10 bg-white text-foreground",
};

function copySelectionAsPlainText(event) {
  const selection = window.getSelection()?.toString().trim();
  if (selection) {
    event.preventDefault();
    event.clipboardData.setData("text/plain", selection);
  }
}

const bubbleClasses = (role) =>
  `max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 ${BUBBLE_STYLES[role]}`;

export default function ChatMessages({ turns = [] }) {
  const logRef = useRef(null);

  return (
    <div className="relative min-h-48 flex-1">
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label="Sohbet mesajları"
        className="absolute inset-0 flex min-h-48 flex-col gap-3 overflow-y-auto scroll-smooth rounded-3xl border border-primary/10 bg-background px-4 pb-4"
      >
        {turns.map((turn, index) => (
          <article
            key={index}
            className={`flex shrink-0 flex-col gap-3${index === turns.length - 1 ? " min-h-full" : ""}`}
          >
            <div className="sticky top-0 z-10 flex flex-col bg-background pt-4 pb-1">
              <div
                data-role="user"
                onCopy={copySelectionAsPlainText}
                className={`${bubbleClasses("user")} break-words`}
              >
                <div className="line-clamp-3">
                  <ReactMarkdown>{turn.question}</ReactMarkdown>
                </div>
              </div>
            </div>
            {turn.answer !== null ? (
              <div
                data-role="bot"
                onCopy={copySelectionAsPlainText}
                className={bubbleClasses("bot")}
              >
                <ReactMarkdown>{turn.answer}</ReactMarkdown>
              </div>
            ) : turn.error !== null ? (
              <p role="alert" className="px-2 text-sm text-red-700">
                {turn.error}
              </p>
            ) : (
              <TypingIndicator />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
