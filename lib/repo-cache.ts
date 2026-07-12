import { kvGet, kvSet } from './kv';

export interface RepoCacheEntry {
  stars: number;
  forks: number;
  valid: boolean;
  manualOverride?: boolean;
}

export type RepoCacheMap = Record<string, RepoCacheEntry>;

const KV_KEY = 'repo_cache_map';

/**
 * Get the full map of cached repositories.
 */
export async function getRepoCache(): Promise<RepoCacheMap> {
  const cached = await kvGet<RepoCacheMap>(KV_KEY);
  return cached || {};
}

/**
 * Save the updated repo cache back to KV.
 */
export async function saveRepoCache(map: RepoCacheMap): Promise<void> {
  // Store permanently
  await kvSet(KV_KEY, map);
}
