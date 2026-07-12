import { getAllStudentSummaries } from './lib/github.ts';
import { writeSummaryCache } from './lib/summary-cache.ts';
import { getFlaggedPRIdSet } from './lib/flagged.ts';
import 'dotenv/config';

async function main() {
  const flagged = await getFlaggedPRIdSet();
  console.log('Regenerating all-time summary...');
  const all = await getAllStudentSummaries('', flagged, false);
  await writeSummaryCache(all, 'all');
  console.log(`Saved ${all.length} summaries to all-time cache.`);
  
  console.log('Regenerating week summary...');
  const week = await getAllStudentSummaries('created:>2026-07-05', flagged, false);
  await writeSummaryCache(week, 'week');
  console.log(`Saved week cache.`);
  
  console.log('Regenerating month summary...');
  const month = await getAllStudentSummaries('created:>2026-06-12', flagged, false);
  await writeSummaryCache(month, 'month');
  console.log(`Saved month cache.`);
}
main();
