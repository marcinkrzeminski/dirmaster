import type { Entry, Project } from "shared";
import { getRedis } from "./config";
import { getEntriesKey, getEntryKey, getProjectKey } from "./keys";

export async function getCachedProject(projectId: string): Promise<Project | null> {
  try {
    const redis = getRedis();
    const data = await redis.get<Project>(getProjectKey(projectId));
    return data ?? null;
  } catch {
    return null;
  }
}

export async function getCachedEntries(projectId: string): Promise<Entry[] | null> {
  try {
    const redis = getRedis();
    const data = await redis.get<Entry[]>(getEntriesKey(projectId));
    return data ?? null;
  } catch {
    return null;
  }
}

export async function getCachedEntry(
  projectId: string,
  entrySlug: string
): Promise<Entry | null> {
  try {
    const redis = getRedis();
    const data = await redis.get<Entry>(getEntryKey(projectId, entrySlug));
    return data ?? null;
  } catch {
    return null;
  }
}
