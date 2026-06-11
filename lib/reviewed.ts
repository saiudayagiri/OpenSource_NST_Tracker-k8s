import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const FILE = join(process.cwd(), 'data', 'reviewed_prs.json');

/** Returns the set of PR keys (e.g. "owner/repo#42") that have been reviewed. */
export function getReviewedPRIds(): Set<string> {
  try {
    const raw = readFileSync(FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function markReviewed(prKey: string): void {
  const ids = getReviewedPRIds();
  ids.add(prKey);
  writeFileSync(FILE, JSON.stringify([...ids], null, 2), 'utf-8');
}

export function unmarkReviewed(prKey: string): void {
  const ids = getReviewedPRIds();
  ids.delete(prKey);
  writeFileSync(FILE, JSON.stringify([...ids], null, 2), 'utf-8');
}
