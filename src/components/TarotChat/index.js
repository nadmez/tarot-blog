"use client";

import { useRef, useState } from "react";
import CardSpread from "../CardSpread";
import ChatInput from "../ChatInput";
import ChatMessages from "../ChatMessages";

const ERROR_MESSAGE =
  "Bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin.";

function playSound(src) {
  const audio = new Audio(src);
  audio.volume = 0.2;
  audio.play()?.catch(() => {});
}

export default function TarotChat() {
  const [turns, setTurns] = useState([]);
  const [activeTurn, setActiveTurn] = useState(0);
  const conversationId = useRef(null);

  const lastTurn = turns.at(-1);
  const isBotTyping =
    lastTurn !== undefined &&
    lastTurn.answer === null &&
    lastTurn.error === null;

  async function handleSubmit(prompt) {
    const index = turns.length;
    setTurns((previous) => [
      ...previous,
      { question: prompt, answer: null, error: null, cards: [] },
    ]);
    setActiveTurn(index);
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
      if (typeof data.message !== "string") {
        throw new Error("Chat response has no message");
      }
      setTurns((previous) =>
        previous.map((turn, i) =>
          i === index
            ? { ...turn, answer: data.message, cards: data.cards ?? [] }
            : turn
        )
      );
      playSound("/sounds/notification.mp3");
    } catch (caught) {
      console.error(caught);
      setTurns((previous) =>
        previous.map((turn, i) =>
          i === index ? { ...turn, error: ERROR_MESSAGE } : turn
        )
      );
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <CardSpread cards={turns[activeTurn]?.cards ?? []} />
      <ChatMessages turns={turns} onActiveTurnChange={setActiveTurn} />
      <ChatInput onSubmit={handleSubmit} isLoading={isBotTyping} />
    </div>
  );
}
