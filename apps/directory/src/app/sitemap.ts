import type { MetadataRoute } from "next";
import { getPublishedEntries, getProject } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [project, entries] = await Promise.all([getProject(), getPublishedEntries()]);
  const baseUrl = project?.domain
    ? `https://${project.domain}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

  const home: MetadataRoute.Sitemap[0] = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  };

  const entryUrls: MetadataRoute.Sitemap = entries.map((entry) => ({
    url: `${baseUrl}/${entry.slug}`,
    lastModified: entry.publishedAt ? new Date(entry.publishedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [home, ...entryUrls];
}
