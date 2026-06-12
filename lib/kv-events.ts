/**
 * lib/kv-events.ts
 *
 * KV-backed events list. Falls back to seeding from data/events.json on first load.
 */

import { kvGet, kvSet } from './kv';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { EventItem } from './types';

const KV_KEY = 'events_list';

async function seedFromFile(): Promise<EventItem[]> {
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'events.json'), 'utf-8');
    const data = JSON.parse(raw);
    const list: EventItem[] = Array.isArray(data) ? data : [];
    await kvSet(KV_KEY, list);
    return list;
  } catch {
    return [];
  }
}

export async function getEventsKV(): Promise<EventItem[]> {
  const cached = await kvGet<EventItem[]>(KV_KEY);
  if (cached !== null) return cached;
  return seedFromFile();
}

export async function addEvent(event: Omit<EventItem, 'id'>): Promise<{ ok: boolean; event?: EventItem }> {
  const list = await getEventsKV();
  const newEvent: EventItem = {
    ...event,
    id: `evt_${Date.now()}`,
  };
  list.push(newEvent);
  // Keep sorted by date ascending
  list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  await kvSet(KV_KEY, list);
  return { ok: true, event: newEvent };
}

export async function updateEvent(id: string, updates: Partial<Omit<EventItem, 'id'>>): Promise<{ ok: boolean }> {
  const list = await getEventsKV();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return { ok: false };
  list[idx] = { ...list[idx], ...updates };
  list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  await kvSet(KV_KEY, list);
  return { ok: true };
}

export async function deleteEvent(id: string): Promise<{ ok: boolean }> {
  const list = await getEventsKV();
  const updated = list.filter((e) => e.id !== id);
  if (updated.length === list.length) return { ok: false };
  await kvSet(KV_KEY, updated);
  return { ok: true };
}
