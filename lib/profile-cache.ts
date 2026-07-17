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

// GitHub's search API returns much more per item (body text, assignees,
// milestone, reactions, etc.) than the app uses. Caching the raw response
// caused prolific accounts to exceed Upstash's 10MB request size limit and
// silently fail to cache at all — trim to exactly what StudentPR/StudentIssue
// declare before writing.
function trimPR(pr: StudentPR): StudentPR {
  return {
    id: pr.id,
    number: pr.number,
    title: pr.title,
    state: pr.state,
    html_url: pr.html_url,
    repository_url: pr.repository_url,
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    closed_at: pr.closed_at,
    draft: pr.draft,
    labels: (pr.labels || []).map((l) => ({ id: l.id, name: l.name, color: l.color })),
    pull_request: pr.pull_request
      ? { merged_at: pr.pull_request.merged_at, html_url: pr.pull_request.html_url }
      : pr.pull_request,
    user: { login: pr.user.login, avatar_url: pr.user.avatar_url, html_url: pr.user.html_url },
  };
}

function trimIssue(issue: StudentIssue): StudentIssue {
  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    state: issue.state,
    html_url: issue.html_url,
    repository_url: issue.repository_url,
    created_at: issue.created_at,
    closed_at: issue.closed_at,
    comments: issue.comments,
    labels: (issue.labels || []).map((l) => ({ id: l.id, name: l.name, color: l.color })),
    user: { login: issue.user.login, avatar_url: issue.user.avatar_url, html_url: issue.user.html_url },
  };
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
    prs: prs.map(trimPR),
    issues: issues.map(trimIssue),
  };
  const ok = await kvSet(getCacheKey(username), entry, TTL_SECS);
  if (!ok) {
    throw new Error(`Failed to write profile cache for ${username} (KV write rejected)`);
  }
}
