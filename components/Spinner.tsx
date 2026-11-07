// Chhota ghoomta hua loader — buttons ke andar. Camera ke aperture jaisa.

export default function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
      <path d="M12 3l3.5 7M21 12l-7 3.5M12 21l-3.5-7M3 12l7-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
