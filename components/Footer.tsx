// Neeche film strip + chhota sa footer text.

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20">
      <div className="film-strip" aria-hidden="true" />
      <div className="bg-ink text-paper/70">
        <div className="mx-auto flex max-w-6xl justify-between px-6 py-5 text-xs uppercase tracking-widest">
          <span>CampusLens · Developed with care</span>
          <span>Roll {currentYear}</span>
        </div>
      </div>
    </footer>
  );
}
