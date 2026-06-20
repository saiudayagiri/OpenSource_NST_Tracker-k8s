import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    console.error('GITHUB_CLIENT_ID is not configured in environment variables.');
    return NextResponse.json(
      { error: 'GitHub OAuth Client ID is not configured.' },
      { status: 500 }
    );
  }

  // Generate GitHub login URL
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user`;

  return NextResponse.redirect(githubUrl);
}
