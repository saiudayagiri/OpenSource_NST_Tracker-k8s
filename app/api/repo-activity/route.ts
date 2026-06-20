import { getGitHubHeaders } from '@/lib/github';

interface SearchItem {
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  pull_request?: any;
}

function buildDateQuery(period: string): string {
  const toISO = (d: Date) => d.toISOString().split('T')[0];
  const ago = (days: number) => toISO(new Date(Date.now() - days * 86_400_000));
  switch (period) {
    case '1day':    return `created:>${ago(1)}`;
    case 'week':    return `created:>${ago(7)}`;
    case 'month':   return `created:>${ago(30)}`;
    case '2months': return `created:>${ago(60)}`;
    case '3months': return `created:>${ago(90)}`;
    default: return '';
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo');
  const period = searchParams.get('period') || 'all';

  if (!repo || !repo.includes('/')) {
    return Response.json({ error: 'Valid repository parameter (owner/repo) is required.' }, { status: 400 });
  }

  const [owner, repoName] = repo.split('/');
  const dateQuery = buildDateQuery(period);
  const qSuffix = dateQuery ? `+${dateQuery}` : '';

  try {
    const headers = await getGitHubHeaders();

    // 1. Fetch Repository Info
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!repoRes.ok) {
      if (repoRes.status === 403 || repoRes.status === 429) {
        return Response.json(
          { error: 'GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN to .env.local.' },
          { status: 403 }
        );
      }
      if (repoRes.status === 404) {
        return Response.json({ error: `Repository '${repo}' not found on GitHub.` }, { status: 404 });
      }
      return Response.json({ error: 'Failed to fetch repository data.' }, { status: repoRes.status });
    }

    const repoData = await repoRes.json();
    const repoInfo = {
      fullName: repoData.full_name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssues: repoData.open_issues_count,
      url: repoData.html_url,
    };

    // 2. Fetch recent PRs and Issues (up to 100 of each)
    const [prsRes, issuesRes] = await Promise.all([
      fetch(`https://api.github.com/search/issues?q=repo:${owner}/${repoName}+is:pr${qSuffix}&per_page=100`, {
        headers,
        next: { revalidate: 600 },
      }),
      fetch(`https://api.github.com/search/issues?q=repo:${owner}/${repoName}+is:issue${qSuffix}&per_page=100`, {
        headers,
        next: { revalidate: 600 },
      }),
    ]);

    if (prsRes.status === 403 || prsRes.status === 429 || issuesRes.status === 403 || issuesRes.status === 429) {
      return Response.json(
        { error: 'GitHub API search rate limit exceeded. Please try again in a minute.' },
        { status: 403 }
      );
    }

    const prsData = prsRes.ok ? await prsRes.json() : { items: [] };
    const issuesData = issuesRes.ok ? await issuesRes.json() : { items: [] };

    const prsItems: SearchItem[] = prsData.items || [];
    const issuesItems: SearchItem[] = issuesData.items || [];

    // 3. Process and group contributors activity
    const contributorMap = new Map<string, {
      username: string;
      avatarUrl: string;
      prsCount: number;
      issuesCount: number;
      prs: any[];
      issues: any[];
    }>();

    const getOrCreateContributor = (login: string, avatarUrl: string) => {
      if (!contributorMap.has(login)) {
        contributorMap.set(login, {
          username: login,
          avatarUrl,
          prsCount: 0,
          issuesCount: 0,
          prs: [],
          issues: [],
        });
      }
      return contributorMap.get(login)!;
    };

    // Process PRs
    for (const pr of prsItems) {
      const c = getOrCreateContributor(pr.user.login, pr.user.avatar_url);
      c.prsCount++;
      c.prs.push({
        number: pr.number,
        title: pr.title,
        url: pr.html_url,
        state: pr.state,
        createdAt: pr.created_at,
      });
    }

    // Process Issues
    for (const issue of issuesItems) {
      const c = getOrCreateContributor(issue.user.login, issue.user.avatar_url);
      c.issuesCount++;
      c.issues.push({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        state: issue.state,
        createdAt: issue.created_at,
      });
    }

    // Convert map to array and sort by activity (PRs first, then issues)
    const contributors = Array.from(contributorMap.values()).sort((a, b) => {
      if (b.prsCount !== a.prsCount) {
        return b.prsCount - a.prsCount;
      }
      return b.issuesCount - a.issuesCount;
    });

    return Response.json({
      repoInfo,
      contributors,
    });
  } catch (error) {
    console.error('Error fetching repo activity:', error);
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
