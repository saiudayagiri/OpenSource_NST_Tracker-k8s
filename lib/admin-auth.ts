import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === 'authenticated';
}
