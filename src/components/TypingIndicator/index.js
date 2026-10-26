export default function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="Yanıt yazılıyor"
      className="flex w-fit gap-1 self-start rounded-2xl border border-primary/10 bg-white px-4 py-3"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-primary/60" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-primary/60 [animation-delay:0.2s]" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-primary/60 [animation-delay:0.4s]" />
    </div>
  );
}
