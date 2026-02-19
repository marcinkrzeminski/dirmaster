import Link from "next/link";
import type { Entry, Project } from "shared";
import { formatDate } from "shared";

interface MinimalTemplateProps {
  project: Project;
  entries: Entry[];
}

export function MinimalTemplate({ project, entries }: MinimalTemplateProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-12 border-b pb-8">
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ fontFamily: "var(--theme-font-heading)" }}
        >
          {project.name}
        </h1>
        <nav className="mt-4 flex gap-6 text-sm">
          <Link href="/" className="hover:underline" style={{ color: "var(--theme-primary)" }}>
            Home
          </Link>
          <Link href="/submit" className="hover:underline" style={{ color: "var(--theme-primary)" }}>
            Submit
          </Link>
        </nav>
      </header>

      <main>
        {entries.length === 0 ? (
          <p className="text-center py-16 opacity-60">No entries yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {entries.map((entry) => (
              <MinimalEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t pt-8 text-sm opacity-60 text-center">
        {project.name} · Powered by DirMaster
      </footer>
    </div>
  );
}

function MinimalEntryCard({ entry }: { entry: Entry }) {
  return (
    <Link href={`/${entry.slug}`} className="block group">
      <article className="rounded-lg border p-5 transition-shadow hover:shadow-md">
        {entry.imageUrl && (
          <img
            src={entry.imageUrl}
            alt={entry.title}
            className="mb-4 h-40 w-full rounded-md object-cover"
          />
        )}
        <h2
          className="font-semibold text-lg group-hover:underline"
          style={{ fontFamily: "var(--theme-font-heading)", color: "var(--theme-primary)" }}
        >
          {entry.title}
        </h2>
        {entry.publishedAt && (
          <p className="mt-1 text-sm opacity-60">{formatDate(entry.publishedAt)}</p>
        )}
        <p className="mt-2 text-sm opacity-80 line-clamp-3">{entry.content.slice(0, 200)}</p>
      </article>
    </Link>
  );
}
