import Link from "next/link";
import type { Entry, Project } from "shared";
import { formatDate } from "shared";

interface ClassicTemplateProps {
  project: Project;
  entries: Entry[];
}

export function ClassicTemplate({ project, entries }: ClassicTemplateProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 text-center border-b-4 pb-6" style={{ borderColor: "var(--theme-primary)" }}>
        <h1
          className="text-4xl font-serif font-bold"
          style={{ fontFamily: "var(--theme-font-heading)", color: "var(--theme-primary)" }}
        >
          {project.name}
        </h1>
        <nav className="mt-4 flex justify-center gap-6 text-sm font-medium border-t border-b py-2 mt-4">
          <Link href="/" className="hover:underline" style={{ color: "var(--theme-primary)" }}>Home</Link>
          <Link href="/submit" className="hover:underline" style={{ color: "var(--theme-primary)" }}>Submit a Listing</Link>
        </nav>
      </header>

      <main>
        <div className="flex gap-8">
          <div className="flex-1">
            {entries.length === 0 ? (
              <p className="py-8 text-center opacity-60">No listings yet.</p>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <ClassicEntryRow key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t pt-4 text-xs opacity-50 text-center">
        © {new Date().getFullYear()} {project.name}. Powered by DirMaster.
      </footer>
    </div>
  );
}

function ClassicEntryRow({ entry }: { entry: Entry }) {
  return (
    <Link href={`/${entry.slug}`} className="block group">
      <article className="flex gap-4 border rounded-md p-4 hover:border-primary transition-colors">
        {entry.imageUrl && (
          <img
            src={entry.imageUrl}
            alt={entry.title}
            className="h-20 w-20 rounded object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h2
            className="font-serif font-semibold text-lg group-hover:underline"
            style={{ fontFamily: "var(--theme-font-heading)", color: "var(--theme-primary)" }}
          >
            {entry.title}
          </h2>
          {entry.publishedAt && (
            <p className="text-xs opacity-50 mt-0.5">{formatDate(entry.publishedAt)}</p>
          )}
          <p className="mt-1 text-sm opacity-80 line-clamp-2">{entry.content.slice(0, 200)}</p>
        </div>
      </article>
    </Link>
  );
}
