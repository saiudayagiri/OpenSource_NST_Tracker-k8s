/**
 * lib/reviewed.ts
 *
 * Stores reviewed/approved PR keys in Vercel KV (or local disk KV fallback).
 * Previously used writeFileSync which was wiped on every Vercel deploy.
 */

import { kvGet, kvSet } from './kv';
import { readFileSync } from 'fs';
import { join } from 'path';

const KV_KEY = 'reviewed_prs';

async function getReviewedList(): Promise<string[]> {
  const cached = await kvGet<string[]>(KV_KEY);
  if (cached !== null) return cached;

  // First-time seed: read from the committed JSON file if KV has nothing
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'reviewed_prs.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    const list: string[] = Array.isArray(parsed) ? parsed : [];
    await kvSet(KV_KEY, list);
    return list;
  } catch {
    return [];
  }
}

/** Returns the set of PR keys (e.g. "owner/repo#42") that have been reviewed. */
export async function getReviewedPRIds(): Promise<Set<string>> {
  const list = await getReviewedList();
  return new Set(list);
}

export async function markReviewed(prKey: string): Promise<void> {
  const list = await getReviewedList();
  if (!list.includes(prKey)) {
    list.push(prKey);
    await kvSet(KV_KEY, list);
  }
}

export async function unmarkReviewed(prKey: string): Promise<void> {
  const list = await getReviewedList();
  const updated = list.filter((k) => k !== prKey);
  await kvSet(KV_KEY, updated);
}
