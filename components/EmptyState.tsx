// Jab dikhane ko kuch na ho (jaise search mein 0 result) — khaali frame ka illustration + message.

import { EmptyFrame } from "@/components/Illustrations";

interface EmptyStateProps {
  title: string;
  message: string;
  children?: React.ReactNode; // optional button ya link
}

export default function EmptyState({ title, message, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <EmptyFrame className="w-48" />
      <h3 className="mt-6 font-display text-3xl">{title}</h3>
      <p className="mt-2 max-w-sm text-ink-soft">{message}</p>
      {children && <div className="mt-7">{children}</div>}
    </div>
  );
}
