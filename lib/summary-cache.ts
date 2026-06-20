import type { StudentSummary } from './github';
import { kvGet, kvSet } from './kv';

/** Minimum gap between public refreshes (5 minutes) */
export const REFRESH_COOLDOWN_MS = 5 * 60 * 1000;

export interface SummaryCache {
  cachedAt: string; // ISO timestamp
  summaries: StudentSummary[];
}

function getCacheKey(period = 'all'): string {
  return `summary_cache:${period || 'all'}`;
}

export async function readSummaryCache(period = 'all'): Promise<SummaryCache | null> {
  return kvGet<SummaryCache>(getCacheKey(period));
}

export async function writeSummaryCache(summaries: StudentSummary[], period = 'all'): Promise<void> {
  const cache: SummaryCache = {
    cachedAt: new Date().toISOString(),
    summaries,
  };
  // Store summary caches for up to 1 day, though they are dynamically updated or invalidated
  await kvSet(getCacheKey(period), cache, 86400);
}

/** Returns true if the cache is younger than the cooldown window */
export function isCacheFresh(cache: SummaryCache): boolean {
  const ageMs = Date.now() - new Date(cache.cachedAt).getTime();
  return ageMs < REFRESH_COOLDOWN_MS;
}

/** Stamps cachedAt as epoch so all predefined caches are immediately stale (used after flagging) */
export async function invalidateSummaryCache(): Promise<void> {
  const periods = ['all', 'week', 'month', '1day', '2months', '3months', '6months', 'year'];
  for (const period of periods) {
    try {
      const cache = await readSummaryCache(period);
      if (cache) {
        cache.cachedAt = '1970-01-01T00:00:00.000Z';
        await writeSummaryCache(cache.summaries, period);
      }
    } catch {
      // ignore — if cache doesn't exist, nothing to invalidate
    }
  }
}
