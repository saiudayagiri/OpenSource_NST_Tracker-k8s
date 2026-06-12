/**
 * lib/kv-achievers.ts
 *
 * KV-backed achievers list. Falls back to seeding from data/achievers.json on first load.
 */

import { kvGet, kvSet } from './kv';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { PersonEntry } from './data';

const KV_KEY = 'achievers_list';

async function seedFromFile(): Promise<PersonEntry[]> {
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'achievers.json'), 'utf-8');
    const data = JSON.parse(raw);
    const list: PersonEntry[] = Array.isArray(data) ? data : [];
    await kvSet(KV_KEY, list);
    return list;
  } catch {
    return [];
  }
}

export async function getAchieversKV(): Promise<PersonEntry[]> {
  const cached = await kvGet<PersonEntry[]>(KV_KEY);
  if (cached !== null) return cached;
  return seedFromFile();
}

export async function addAchiever(entry: PersonEntry): Promise<{ ok: boolean; message?: string }> {
  const list = await getAchieversKV();
  if (list.some((a) => a.github.toLowerCase() === entry.github.toLowerCase()))
    return { ok: false, message: `${entry.github} is already in achievers` };
  list.push(entry);
  await kvSet(KV_KEY, list);
  return { ok: true };
}

export async function updateAchiever(github: string, updates: Partial<PersonEntry>): Promise<{ ok: boolean }> {
  const list = await getAchieversKV();
  const idx = list.findIndex((a) => a.github.toLowerCase() === github.toLowerCase());
  if (idx === -1) return { ok: false };
  list[idx] = { ...list[idx], ...updates };
  await kvSet(KV_KEY, list);
  return { ok: true };
}

export async function deleteAchiever(github: string): Promise<{ ok: boolean }> {
  const list = await getAchieversKV();
  const updated = list.filter((a) => a.github.toLowerCase() !== github.toLowerCase());
  if (updated.length === list.length) return { ok: false };
  await kvSet(KV_KEY, updated);
  return { ok: true };
}

export async function getAchieverKV(github: string): Promise<PersonEntry | undefined> {
  const list = await getAchieversKV();
  return list.find((a) => a.github.toLowerCase() === github.toLowerCase());
}
