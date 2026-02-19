import type { Entry, Project } from "shared";
import { CACHE_TTL, getRedis } from "./config";
import { getEntriesKey, getEntryKey, getProjectKey } from "./keys";

export async function setCachedProject(project: Project): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(getProjectKey(project.id), project, { ex: CACHE_TTL });
  } catch {
    // Cache errors are non-fatal — log and continue
    console.error("[cache] Failed to set project cache", project.id);
  }
}

export async function setCachedEntries(
  projectId: string,
  entries: Entry[]
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(getEntriesKey(projectId), entries, { ex: CACHE_TTL });
  } catch {
    console.error("[cache] Failed to set entries cache", projectId);
  }
}

export async function setCachedEntry(entry: Entry): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(getEntryKey(entry.projectId, entry.slug), entry, {
      ex: CACHE_TTL,
    });
  } catch {
    console.error("[cache] Failed to set entry cache", entry.id);
  }
}

export async function invalidateProjectCache(projectId: string): Promise<void> {
  try {
    const redis = getRedis();
    const keys = [getProjectKey(projectId), getEntriesKey(projectId)];
    await redis.del(...keys);
  } catch {
    console.error("[cache] Failed to invalidate project cache", projectId);
  }
}

export async function invalidateEntryCache(
  projectId: string,
  entrySlug: string
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(getEntryKey(projectId, entrySlug));
    // Also invalidate the entries list so it gets refreshed
    await redis.del(getEntriesKey(projectId));
  } catch {
    console.error("[cache] Failed to invalidate entry cache", projectId, entrySlug);
  }
}
