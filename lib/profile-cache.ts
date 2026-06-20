import type { GitHubUser, StudentPR, StudentIssue } from './github';
import { kvGet, kvSet } from './kv';

const TTL_MS = 60 * 60 * 1000; // 1 hour (in ms for freshness check)
const TTL_SECS = 30 * 24 * 3600; // 30 days physical cache TTL

export interface ProfileCacheEntry {
  cachedAt: string;
  profile: GitHubUser;
  prs: StudentPR[];
  issues: StudentIssue[];
}

function getCacheKey(username: string): string {
  return `profile_cache:${username.toLowerCase()}`;
}

export async function readProfileCache(username: string): Promise<ProfileCacheEntry | null> {
  return kvGet<ProfileCacheEntry>(getCacheKey(username));
}

export function isProfileFresh(entry: ProfileCacheEntry): boolean {
  return Date.now() - new Date(entry.cachedAt).getTime() < TTL_MS;
}

export async function writeProfileCache(
  username: string,
  profile: GitHubUser,
  prs: StudentPR[],
  issues: StudentIssue[]
): Promise<void> {
  const entry: ProfileCacheEntry = {
    cachedAt: new Date().toISOString(),
    profile,
    prs,
    issues,
  };
  await kvSet(getCacheKey(username), entry, TTL_SECS);
}
