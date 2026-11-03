// Loading screen — "photo develop ho rahi hai" wali feel.

export default function Developing({ text = "Developing…" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center py-32" role="status">
      <div className="polaroid w-36 -rotate-2">
        <div className="aspect-square animate-pulse bg-gradient-to-br from-ink/80 via-plum/60 to-rust/50" />
        <div className="mt-3 h-3 w-20 bg-line" />
      </div>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-muted">{text}</p>
    </div>
  );
}
