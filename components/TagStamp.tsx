// Hashtag ko rubber stamp jaisa dikhata hai. Click karne pe us tag se search hota hai.

const inks = ["text-rust", "text-teal", "text-plum", "text-ink", "text-mustard"];
const tilts = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

interface TagStampProps {
  tag: string;
  count?: number;
  index: number;
  isActive?: boolean;
  onClick: () => void;
}

export default function TagStamp({ tag, count, index, isActive = false, onClick }: TagStampProps) {
  const ink = inks[index % inks.length];
  const tilt = tilts[index % tilts.length];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`rubber-stamp ${tilt} transition hover:rotate-0 hover:scale-105 ${
        isActive ? "border-ink bg-ink text-paper-light" : `${ink} bg-paper-light/40`
      }`}
    >
      #{tag}
      {count !== undefined && <span className="opacity-60">×{count}</span>}
    </button>
  );
}
