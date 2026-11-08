"use client";

import { useState } from "react";
import { ArrowUpIcon } from "../icons";

export default function ChatInput({ onSubmit, isLoading = false }) {
  const [prompt, setPrompt] = useState("");
  const canSend = prompt.trim().length > 0 && !isLoading;

  function send() {
    if (!canSend) return;
    const text = prompt.trim();
    setPrompt("");
    onSubmit(text);
  }

  function handleSubmit(event) {
    event.preventDefault();
    send();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 rounded-full border border-primary/20 bg-white px-4 py-1.5 shadow-sm focus-within:border-primary/50"
    >
      <label htmlFor="tarot-prompt" className="sr-only">
        Sorunuzu yazın
      </label>
      <textarea
        id="tarot-prompt"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Tarota sorunuzu yazın..."
        rows={1}
        maxLength={1000}
        disabled={isLoading}
        className="w-full resize-none bg-transparent py-1.5 text-[12px] leading-[15px] text-foreground outline-none placeholder:text-foreground/40"
      />
      <button
        type="submit"
        aria-label="Gönder"
        disabled={!canSend}
        className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowUpIcon className="size-[15px]" aria-hidden="true" />
      </button>
    </form>
  );
}
