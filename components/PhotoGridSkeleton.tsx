// Photos load ho rahi hon tab: halftone dots wale khaali prints.

const shapes = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[5/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-square", "aspect-[3/4]"];

export default function PhotoGridSkeleton() {
  return (
    <div className="columns-2 gap-6 md:columns-3 lg:columns-4" aria-hidden="true">
      {shapes.map((shape, i) => (
        <div key={i} className="mb-8 break-inside-avoid">
          <div className="rounded-2xl border-2 border-ink/30 bg-white p-2">
            <div className={`halftone rounded-xl ${shape}`} style={{ animationDelay: `${i * 90}ms` }} />
          </div>
          <div className="mt-3 h-4 w-3/4 rounded-full bg-sky" />
          <div className="mt-2 h-3 w-1/2 rounded-full bg-sky" />
        </div>
      ))}
    </div>
  );
}
