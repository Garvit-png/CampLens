// Jab dikhane ko kuch na ho (jaise search mein 0 result) — ek khaali polaroid aur message.

interface EmptyStateProps {
  title: string;
  message: string;
  children?: React.ReactNode; // optional button ya link
}

export default function EmptyState({ title, message, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="polaroid w-44 rotate-3">
        <div className="grid aspect-square place-items-center bg-ink/85 text-xs uppercase tracking-widest text-paper/50">
          No print
        </div>
        <p className="mt-2 font-hand text-xl">nothing yet…</p>
      </div>
      <h3 className="mt-8 font-serif text-3xl">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">{message}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
