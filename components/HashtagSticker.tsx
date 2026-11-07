// Hashtag sticker. Click karne pe us tag se search hota hai.

// Har sticker thoda alag tircha aur alag rang ka — jaise laptop pe chipke hon
const looks = [
  "bg-white -rotate-1",
  "bg-sun rotate-1",
  "bg-pink-soft -rotate-2",
  "bg-white rotate-2",
  "bg-sky rotate-0",
];

interface HashtagStickerProps {
  tag: string;
  count?: number;
  index: number;
  isActive?: boolean;
  onClick: () => void;
}

export default function HashtagSticker({ tag, count, index, isActive = false, onClick }: HashtagStickerProps) {
  const look = looks[index % looks.length];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`sticker ${isActive ? "rotate-0 bg-ink text-white shadow-[3px_3px_0_var(--color-pink)]" : look}`}
    >
      #{tag}
      {count !== undefined && (
        <span className={`text-sm font-normal ${isActive ? "text-white/70" : "text-ink-soft"}`}>{count}</span>
      )}
    </button>
  );
}
