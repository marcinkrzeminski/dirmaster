import Link from "next/link";
import type { Entry, Project } from "shared";
import { formatDate } from "shared";

interface BoldTemplateProps {
  project: Project;
  entries: Entry[];
}

export function BoldTemplate({ project, entries }: BoldTemplateProps) {
  return (
    <div>
      <header
        className="py-16 px-4 text-center"
        style={{ background: "var(--theme-primary)", color: "#fff" }}
      >
        <h1
          className="text-5xl font-extrabold tracking-tight drop-shadow"
          style={{ fontFamily: "var(--theme-font-heading)" }}
        >
          {project.name}
        </h1>
        <nav className="mt-6 flex justify-center gap-8 text-sm font-semibold uppercase tracking-widest">
          <Link href="/" className="hover:opacity-80">Home</Link>
          <Link href="/submit" className="hover:opacity-80">Submit</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        {entries.length === 0 ? (
          <p className="text-center py-16 opacity-60">No entries yet.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <BoldEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>

      <footer
        className="py-8 text-center text-sm"
        style={{ background: "var(--theme-primary)", color: "rgba(255,255,255,0.7)" }}
      >
        {project.name} · Powered by DirMaster
      </footer>
    </div>
  );
}

function BoldEntryCard({ entry }: { entry: Entry }) {
  return (
    <Link href={`/${entry.slug}`} className="block group">
      <article
        className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow"
        style={{ background: "var(--theme-background)", color: "var(--theme-foreground)" }}
      >
        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt={entry.title}
            className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="h-48 w-full flex items-center justify-center text-4xl font-black opacity-20"
            style={{ background: "var(--theme-primary)" }}
          >
            {entry.title.charAt(0)}
          </div>
        )}
        <div className="p-5">
          <h2
            className="text-xl font-extrabold"
            style={{ fontFamily: "var(--theme-font-heading)", color: "var(--theme-primary)" }}
          >
            {entry.title}
          </h2>
          {entry.publishedAt && (
            <p className="mt-1 text-xs opacity-50">{formatDate(entry.publishedAt)}</p>
          )}
          <p className="mt-2 text-sm opacity-80 line-clamp-2">{entry.content.slice(0, 150)}</p>
        </div>
      </article>
    </Link>
  );
}
