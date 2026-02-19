import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProject, getEntryBySlug, getPublishedEntries } from "@/lib/data";
import { formatDate } from "shared";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [project, entry] = await Promise.all([getProject(), getEntryBySlug(slug)]);

  if (!entry || !project) return {};

  const seo =
    (project.settings?.seo as {
      titleTemplate?: string;
      defaultDescription?: string;
    }) ?? {};

  const title = seo.titleTemplate
    ? seo.titleTemplate.replace("%s", entry.title)
    : entry.title;

  return {
    title,
    description: entry.content.slice(0, 160),
    openGraph: {
      title,
      description: entry.content.slice(0, 160),
      images: entry.imageUrl ? [{ url: entry.imageUrl }] : [],
      type: "article",
      publishedTime: entry.publishedAt
        ? new Date(entry.publishedAt).toISOString()
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: entry.content.slice(0, 160),
      images: entry.imageUrl ? [entry.imageUrl] : [],
    },
  };
}

export async function generateStaticParams() {
  const entries = await getPublishedEntries();
  return entries.map((e) => ({ slug: e.slug }));
}

export default async function EntryPage({ params }: Props) {
  const { slug } = await params;
  const [project, entry] = await Promise.all([getProject(), getEntryBySlug(slug)]);

  if (!entry || !project) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.content.slice(0, 160),
    datePublished: entry.publishedAt ? new Date(entry.publishedAt).toISOString() : undefined,
    image: entry.imageUrl,
    publisher: {
      "@type": "Organization",
      name: project.name,
    },
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-8 text-sm">
        <Link
          href="/"
          className="hover:underline"
          style={{ color: "var(--theme-primary)" }}
        >
          ← {project.name}
        </Link>
      </nav>

      {entry.imageUrl && (
        <img
          src={entry.imageUrl}
          alt={entry.title}
          className="mb-8 w-full rounded-xl object-cover"
          style={{ maxHeight: "400px" }}
        />
      )}

      <h1
        className="text-4xl font-bold tracking-tight"
        style={{
          fontFamily: "var(--theme-font-heading)",
          color: "var(--theme-foreground)",
        }}
      >
        {entry.title}
      </h1>

      {entry.publishedAt && (
        <p className="mt-2 text-sm opacity-60">{formatDate(entry.publishedAt)}</p>
      )}

      <div
        className="mt-8 prose prose-lg max-w-none"
        style={{ color: "var(--theme-foreground)" }}
      >
        {entry.content.split("\n").map((paragraph, i) => (
          <p key={i} className="mb-4 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {Object.keys(entry.metadata).length > 0 && (
        <div className="mt-10 rounded-xl border p-6">
          <h2 className="font-semibold text-lg mb-4">Details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(entry.metadata).map(([k, v]) => (
              <div key={k}>
                <dt className="opacity-60 capitalize">{k}</dt>
                <dd className="font-medium">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </main>
  );
}
