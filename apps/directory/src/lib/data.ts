import { init as initAdmin } from "@instantdb/admin";
import {
  getCachedEntries,
  getCachedEntry,
  getCachedProject,
  setCachedEntries,
  setCachedEntry,
  setCachedProject,
} from "cache";
import type { Entry, Project } from "shared";
import { schema } from "db";

function getAdminDb() {
  const appId = process.env.INSTANTDB_APP_ID!;
  const adminToken = process.env.INSTANTDB_ADMIN_TOKEN!;
  return initAdmin({ appId, adminToken, schema });
}

export async function getProject(): Promise<Project | null> {
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
  if (!projectId) return null;

  const cached = await getCachedProject(projectId);
  if (cached) return cached;

  const db = getAdminDb();
  const result = await db.query({
    projects: { $: { where: { id: projectId } } },
  });

  const raw = result.projects?.[0];
  if (!raw) return null;

  const project: Project = {
    id: raw.id,
    ownerId: raw.ownerId as string,
    name: raw.name as string,
    slug: raw.slug as string,
    domain: raw.domain as string | undefined,
    settings: (raw.settings as Project["settings"]) ?? {},
    createdAt: raw.createdAt as number,
  };

  await setCachedProject(project);
  return project;
}

export async function getPublishedEntries(): Promise<Entry[]> {
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
  if (!projectId) return [];

  const cached = await getCachedEntries(projectId);
  if (cached) return cached;

  const db = getAdminDb();
  const result = await db.query({
    entries: {
      $: { where: { projectId, status: "published" } },
    },
  });

  const entries: Entry[] = (result.entries ?? []).map((e) => ({
    id: e.id,
    projectId: e.projectId as string,
    title: e.title as string,
    slug: e.slug as string,
    content: e.content as string,
    status: e.status as Entry["status"],
    metadata: (e.metadata as Record<string, unknown>) ?? {},
    imageUrl: e.imageUrl as string | undefined,
    createdAt: e.createdAt as number,
    publishedAt: e.publishedAt as number | undefined,
  }));

  await setCachedEntries(projectId, entries);
  return entries;
}

export async function getEntryBySlug(slug: string): Promise<Entry | null> {
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
  if (!projectId) return null;

  const cached = await getCachedEntry(projectId, slug);
  if (cached) return cached;

  const db = getAdminDb();
  const result = await db.query({
    entries: { $: { where: { projectId, slug, status: "published" } } },
  });

  const raw = result.entries?.[0];
  if (!raw) return null;

  const entry: Entry = {
    id: raw.id,
    projectId: raw.projectId as string,
    title: raw.title as string,
    slug: raw.slug as string,
    content: raw.content as string,
    status: raw.status as Entry["status"],
    metadata: (raw.metadata as Record<string, unknown>) ?? {},
    imageUrl: raw.imageUrl as string | undefined,
    createdAt: raw.createdAt as number,
    publishedAt: raw.publishedAt as number | undefined,
  };

  await setCachedEntry(entry);
  return entry;
}
