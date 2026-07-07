import { NextResponse } from 'next/server';
import { updateStaleProfiles, buildDateQuery, getSummaryFromCache } from '@/lib/github';
import { getFlaggedPRIdSet } from '@/lib/flagged';
import { writeSummaryCache, readSummaryCache } from '@/lib/summary-cache';
import { readProfileCache } from '@/lib/profile-cache';
import { getStudentsKV } from '@/lib/kv-students';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function performIncrementalRefresh() {
  // 1. Refresh up to 5 stale profiles (cursor-based round-robin, O(1) KV reads)
  console.log('[Incremental Refresh] Starting stale profile updates...');
  const updatedUsers = await updateStaleProfiles(5);
  console.log('[Incremental Refresh] Updated users:', updatedUsers);

  if (updatedUsers.length === 0) {
    return { ok: true, updatedUsers: [], message: 'All profiles are fresh. Nothing to update.' };
  }

  // 2. Patch ONLY the updated students in every summary cache period (O(n) where n=updatedUsers.length)
  //    This avoids reading all 1914+ profiles on every cron run.
  console.log('[Incremental Refresh] Patching summary caches for updated users...');
  const flaggedPRIds = await getFlaggedPRIdSet();
  const students = await getStudentsKV();
  const periods = ['all', 'week', 'month'];

  for (const period of periods) {
    const existingCache = await readSummaryCache(period);
    if (!existingCache) continue;

    const dateQuery = buildDateQuery(period);
    let changed = false;

    for (const username of updatedUsers) {
      const updatedCache = await readProfileCache(username);
      if (!updatedCache) continue;

      const student = students.find(s => s.github.toLowerCase() === username.toLowerCase());
      const freshSummary = getSummaryFromCache(updatedCache, dateQuery, flaggedPRIds);
      if (student) {
        freshSummary.year = student.year;
        freshSummary.campus = student.campus;
      }

      const idx = existingCache.summaries.findIndex(
        s => s.profile.login.toLowerCase() === username.toLowerCase()
      );
      if (idx !== -1) {
        existingCache.summaries[idx] = freshSummary;
      } else {
        existingCache.summaries.push(freshSummary);
      }
      changed = true;
    }

    if (changed) {
      existingCache.summaries.sort((a, b) => b.scoreMergedPRs - a.scoreMergedPRs);
      await writeSummaryCache(existingCache.summaries, period);
      console.log(`[Incremental Refresh] Patched summary cache for period: ${period}`);
    }
  }

  // 3. Revalidate Next.js pages
  revalidatePath('/contributors');
  revalidatePath('/');
  console.log('[Incremental Refresh] Next.js paths revalidated.');

  return {
    ok: true,
    updatedUsers,
    message: `Successfully refreshed cache for: ${updatedUsers.join(', ')}`,
  };
}

export async function POST(request: Request) {
  try {
    const result = await performIncrementalRefresh();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Incremental Refresh] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const result = await performIncrementalRefresh();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Incremental Refresh] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
