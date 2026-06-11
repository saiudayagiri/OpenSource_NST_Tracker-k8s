import { cookies } from 'next/headers';
import { markReviewed, unmarkReviewed } from '@/lib/reviewed';

const COOKIE_NAME = 'admin_session';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === 'authenticated';
}

/** POST /api/admin/approve — mark a PR as approved (no flag, just remove from queue) */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const { id } = body as { id?: string };
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
  markReviewed(id);
  return Response.json({ ok: true });
}

/** DELETE /api/admin/approve?id=<prKey> — undo approval (put back in queue) */
export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'Missing ?id= param' }, { status: 400 });
  unmarkReviewed(id);
  return Response.json({ ok: true });
}
