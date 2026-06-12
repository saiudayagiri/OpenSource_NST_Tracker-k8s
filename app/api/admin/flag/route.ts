import { cookies } from 'next/headers';
import { getFlaggedPRs, flagPR, unflagPR, FlagReason } from '@/lib/flagged';
import { markReviewed, unmarkReviewed } from '@/lib/reviewed';
import { invalidateSummaryCache } from '@/lib/summary-cache';

const COOKIE_NAME = 'admin_session';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === 'authenticated';
}

/** GET /api/admin/flag — list all flagged PRs */
export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return Response.json(await getFlaggedPRs());
}

/** POST /api/admin/flag — flag a PR (also marks it reviewed so it leaves the queue) */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { id, url, title, author, reason, note } = body as {
    id?: string;
    url?: string;
    title?: string;
    author?: string;
    reason?: FlagReason;
    note?: string;
  };

  if (!id || !url || !title || !author || !reason) {
    return Response.json({ error: 'Missing required fields: id, url, title, author, reason' }, { status: 400 });
  }

  const validReasons: FlagReason[] = ['fake', 'self_pr', 'low_quality'];
  if (!validReasons.includes(reason)) {
    return Response.json({ error: `reason must be one of: ${validReasons.join(', ')}` }, { status: 400 });
  }

  await flagPR({ id, url, title, author, reason, note, flaggedAt: new Date().toISOString() });
  // Also mark reviewed so it leaves the queue
  await markReviewed(id);
  // Invalidate summary cache so public sees updated scores on next refresh
  await invalidateSummaryCache();
  return Response.json({ ok: true });
}

/** DELETE /api/admin/flag?id=<prId> — unflag a PR (also removes from reviewed so it goes back to queue) */
export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return Response.json({ error: 'Missing ?id= param' }, { status: 400 });
  }

  const removed = await unflagPR(id);
  // Also unmark reviewed so admin can re-review if needed
  if (removed) await unmarkReviewed(id);
  // Invalidate summary cache so public sees restored scores on next refresh
  if (removed) await invalidateSummaryCache();
  return Response.json({ ok: removed });
}
