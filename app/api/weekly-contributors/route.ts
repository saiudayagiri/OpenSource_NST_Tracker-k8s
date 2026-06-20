import { getAllStudentSummaries, buildDateQuery } from '@/lib/github';
import { readSummaryCache, writeSummaryCache } from '@/lib/summary-cache';
import { getFlaggedPRIdSet } from '@/lib/flagged';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Attempt to load from the 'week' summary cache
    let cache = await readSummaryCache('week');

    // If cache is empty or older than 5 minutes, try fetching live but fall back gracefully
    if (!cache) {
      const flaggedPRIds = await getFlaggedPRIdSet();
      const dateQuery = buildDateQuery('week');
      const summaries = await getAllStudentSummaries(dateQuery, flaggedPRIds);
      await writeSummaryCache(summaries, 'week');
      cache = { cachedAt: new Date().toISOString(), summaries };
    }

    const contributors = cache.summaries.map((s) => ({
      username: s.profile.login,
      name: s.profile.name ?? s.profile.login,
      avatarUrl: s.profile.avatar_url,
      mergedCount: s.mergedPRs,
      totalCount: s.totalPRs,
      issuesCount: s.issuesCount,
    }));

    return Response.json({ contributors });
  } catch (error) {
    console.error('Error fetching weekly contributors:', error);
    return Response.json({ contributors: [] });
  }
}
