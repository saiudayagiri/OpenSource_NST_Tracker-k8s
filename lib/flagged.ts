import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const FILE = join(process.cwd(), 'data', 'flagged_prs.json');

export type FlagReason = 'fake' | 'self_pr' | 'low_quality';

export interface FlaggedPR {
  /** GitHub PR node id or "<owner>/<repo>#<number>" string */
  id: string;
  /** PR HTML URL for display */
  url: string;
  /** PR title for display */
  title: string;
  /** GitHub username of the PR author */
  author: string;
  /** Why this PR was flagged */
  reason: FlagReason;
  /** ISO timestamp when it was flagged */
  flaggedAt: string;
  /** Optional admin note */
  note?: string;
}

export function getFlaggedPRs(): FlaggedPR[] {
  try {
    const raw = readFileSync(FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFlaggedPRs(list: FlaggedPR[]): void {
  writeFileSync(FILE, JSON.stringify(list, null, 2), 'utf-8');
}

export function isFlagged(prId: string): boolean {
  return getFlaggedPRs().some((f) => f.id === prId);
}

export function flagPR(entry: FlaggedPR): void {
  const list = getFlaggedPRs().filter((f) => f.id !== entry.id);
  list.push(entry);
  saveFlaggedPRs(list);
}

export function unflagPR(prId: string): boolean {
  const before = getFlaggedPRs();
  const after = before.filter((f) => f.id !== prId);
  if (after.length === before.length) return false;
  saveFlaggedPRs(after);
  return true;
}
