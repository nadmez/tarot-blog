"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

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

export default function ChatMessages({ messages = [] }) {
  const logRef = useRef(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) {
      log.scrollTop = log.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={logRef}
      role="log"
      aria-live="polite"
      aria-label="Sohbet mesajları"
      className="flex min-h-48 flex-1 flex-col gap-3 overflow-y-auto scroll-smooth rounded-3xl border border-primary/10 bg-background p-4"
    >
      {messages.map((message, index) => (
        <div
          key={index}
          data-role={message.role}
          onCopy={copySelectionAsPlainText}
          className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 ${BUBBLE_STYLES[message.role]}`}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      ))}
    </div>
  );
}
