"use client";

import { useRef, useState } from "react";
import CardSpread from "../CardSpread";
import ChatInput from "../ChatInput";
import ChatMessages from "../ChatMessages";
import TypingIndicator from "../TypingIndicator";

const ERROR_MESSAGE =
  "Bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin.";

function playSound(src) {
  const audio = new Audio(src);
  audio.volume = 0.2;
  audio.play()?.catch(() => {});
}

export default function TarotChat() {
  const [messages, setMessages] = useState([]);
  const [cards, setCards] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [error, setError] = useState(null);
  const conversationId = useRef(null);

  async function handleSubmit(prompt) {
    setMessages((previous) => [...previous, { role: "user", content: prompt }]);
    setIsBotTyping(true);
    setError(null);
    setCards([]);
    playSound("/sounds/pop.mp3");
    conversationId.current ??= crypto.randomUUID();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          conversationId: conversationId.current,
        }),
      });
      if (!response.ok) {
        throw new Error(`Chat request failed with status ${response.status}`);
      }
      const data = await response.json();
      setMessages((previous) => [
        ...previous,
        { role: "bot", content: data.message },
      ]);
      setCards(data.cards ?? []);
      playSound("/sounds/notification.mp3");
    } catch (caught) {
      console.error(caught);
      setError(ERROR_MESSAGE);
    } finally {
      setIsBotTyping(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <CardSpread cards={cards} />
      <div className="flex flex-col gap-3">
        <ChatMessages messages={messages} />
        {isBotTyping && <TypingIndicator />}
        {error && (
          <p role="alert" className="px-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
      <ChatInput onSubmit={handleSubmit} isLoading={isBotTyping} />
    </div>
  );
}
