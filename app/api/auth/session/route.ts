import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('github_oauth_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!userRes.ok) {
      // If token is invalid or expired, clear it
      cookieStore.delete('github_oauth_token');
      return NextResponse.json({ authenticated: false });
    }

    const userData = await userRes.json();
    return NextResponse.json({
      authenticated: true,
      user: {
        username: userData.login,
        name: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
      },
    });
  } catch (error) {
    console.error('Session endpoint error:', error);
    return NextResponse.json({ authenticated: false, error: 'Network error verifying session' });
  }
}
