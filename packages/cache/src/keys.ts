/**
 * Cache key helpers.
 * All keys are namespaced under "dm:" (dirmaster).
 */

export const cacheKeys = {
  project: (projectId: string) => `dm:project:${projectId}`,
  entries: (projectId: string) => `dm:entries:${projectId}`,
  entry: (projectId: string, entrySlug: string) =>
    `dm:entry:${projectId}:${entrySlug}`,
  projectPattern: (projectId: string) => `dm:*:${projectId}*`,
} as const;

export function getProjectKey(projectId: string): string {
  return cacheKeys.project(projectId);
}

export function getEntriesKey(projectId: string): string {
  return cacheKeys.entries(projectId);
}

export function getEntryKey(projectId: string, entrySlug: string): string {
  return cacheKeys.entry(projectId, entrySlug);
}
