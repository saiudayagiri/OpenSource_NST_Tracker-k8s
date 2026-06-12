import { cookies } from 'next/headers';
import { getEventsKV, addEvent, updateEvent, deleteEvent } from '@/lib/kv-events';
import { revalidatePath } from 'next/cache';

const COOKIE_NAME = 'admin_session';
async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === 'authenticated';
}

/** GET /api/admin/events — list all events */
export async function GET() {
  if (!(await isAuthenticated())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const events = await getEventsKV();
  return Response.json(events);
}

/** POST /api/admin/events — create a new event */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const { title, date, type, description, link } = body as {
    title?: string; date?: string; type?: string; description?: string; link?: string;
  };
  if (!title?.trim() || !date?.trim() || !type?.trim()) {
    return Response.json({ error: 'Missing required fields: title, date, type' }, { status: 400 });
  }
  const validTypes = ['session', 'deadline', 'announcement'];
  if (!validTypes.includes(type)) {
    return Response.json({ error: `type must be one of: ${validTypes.join(', ')}` }, { status: 400 });
  }
  const result = await addEvent({
    title: title.trim(),
    date: date.trim(),
    type: type as 'session' | 'deadline' | 'announcement',
    description: description?.trim() ?? '',
    ...(link?.trim() ? { link: link.trim() } : {}),
  });
  revalidatePath('/');
  return Response.json({ ok: true, event: result.event });
}

/** PATCH /api/admin/events — update an existing event { id, ...updates } */
export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const { id, ...updates } = body as { id?: string; [k: string]: unknown };
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
  const result = await updateEvent(id, updates as Parameters<typeof updateEvent>[1]);
  if (!result.ok) return Response.json({ error: 'Event not found' }, { status: 404 });
  revalidatePath('/');
  return Response.json({ ok: true });
}

/** DELETE /api/admin/events?id=<eventId> — delete an event */
export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'Missing ?id= param' }, { status: 400 });
  const result = await deleteEvent(id);
  if (!result.ok) return Response.json({ error: 'Event not found' }, { status: 404 });
  revalidatePath('/');
  return Response.json({ ok: true });
}
