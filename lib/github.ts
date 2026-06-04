import { readFileSync } from 'fs';
import { join } from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const baseHeaders: HeadersInit = {
  Accept: 'application/vnd.github.v3+json',
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
};

async function githubSearch<T>(
  q: string,
  page = 1,
  perPage = 100
): Promise<{ total_count: number; items: T[] } | null> {
  const res = await fetch(
    `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=created&order=desc&per_page=${perPage}&page=${page}`,
    { headers: baseHeaders, next: { revalidate: 3600 } }
  );
  if (!res.ok) return null;
  return res.json();
}

export interface StudentPR {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  repository_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  draft: boolean;
  labels: Array<{ id: number; name: string; color: string }>;
  pull_request: {
    merged_at: string | null;
    html_url: string;
  };
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  created_at: string;
}

export interface Student {
  github: string;
  mentor?: string;
}

export interface StudentSummary {
  profile: GitHubUser;
  mentor?: string;
  totalPRs: number;
  mergedPRs: number;
  openPRs: number;
  closedPRs: number;
}

export function getStudents(): Student[] {
  try {
    const filePath = join(process.cwd(), 'data', 'students.json');
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    if (!Array.isArray(data)) return [];
    return data
      .map((s) => {
        if (typeof s === 'string') return { github: s };
        if (typeof s === 'object' && s !== null && typeof s.github === 'string')
          return { github: s.github, mentor: s.mentor || undefined };
        return null;
      })
      .filter((s): s is Student => s !== null);
  } catch {
    return [];
  }
}

export function getMentorForStudent(username: string): string | undefined {
  const students = getStudents();
  return students.find(
    (s) => s.github.toLowerCase() === username.toLowerCase()
  )?.mentor;
}

export async function getStudentProfile(username: string): Promise<GitHubUser | null> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: baseHeaders,
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

export interface StudentIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  repository_url: string;
  created_at: string;
  closed_at: string | null;
  comments: number;
  labels: Array<{ id: number; name: string; color: string }>;
  user: { login: string; avatar_url: string; html_url: string };
}

// PRs authored by username in repos NOT owned by username (excludes own repos & forks)
function searchPRs(username: string, extra = '', page = 1, perPage = 100) {
  return githubSearch<StudentPR>(
    `is:pr author:${username} -user:${username}${extra ? ' ' + extra : ''}`,
    page,
    perPage
  );
}

export async function getStudentIssues(username: string): Promise<StudentIssue[]> {
  const all: StudentIssue[] = [];
  let page = 1;
  const maxPages = GITHUB_TOKEN ? 10 : 3;
  while (page <= maxPages) {
    const data = await githubSearch<StudentIssue>(
      `is:issue author:${username} -user:${username}`,
      page
    );
    if (!data) break;
    all.push(...data.items);
    if (all.length >= data.total_count || data.items.length < 100) break;
    page++;
  }
  return all;
}

export async function getStudentReviews(username: string): Promise<StudentPR[]> {
  const all: StudentPR[] = [];
  let page = 1;
  const maxPages = GITHUB_TOKEN ? 10 : 3;
  while (page <= maxPages) {
    const data = await githubSearch<StudentPR>(
      `is:pr reviewed-by:${username} -user:${username} -author:${username}`,
      page
    );
    if (!data) break;
    all.push(...data.items);
    if (all.length >= data.total_count || data.items.length < 100) break;
    page++;
  }
  return all;
}

export async function getStudentCounts(username: string) {
  const count = async (q: string) => {
    const data = await githubSearch(q, 1, 1);
    return data?.total_count ?? 0;
  };
  const [prs, mergedPRs, openPRs, issues, reviews] = await Promise.all([
    count(`is:pr author:${username} -user:${username}`),
    count(`is:pr is:merged author:${username} -user:${username}`),
    count(`is:pr is:open author:${username} -user:${username}`),
    count(`is:issue author:${username} -user:${username}`),
    count(`is:pr reviewed-by:${username} -user:${username} -author:${username}`),
  ]);
  return { prs, mergedPRs, openPRs, issues, reviews };
}

export async function getStudentPRs(username: string): Promise<StudentPR[]> {
  const allPRs: StudentPR[] = [];
  let page = 1;
  const maxPages = GITHUB_TOKEN ? 10 : 3;

  while (page <= maxPages) {
    const data = await searchPRs(username, '', page);
    if (!data) break;
    allPRs.push(...data.items);
    if (allPRs.length >= data.total_count || data.items.length < 100) break;
    page++;
  }

  return allPRs;
}

export async function getStudentSummary(student: Student, dateQuery = ''): Promise<StudentSummary | null> {
  const [profile, data] = await Promise.all([
    getStudentProfile(student.github),
    searchPRs(student.github, dateQuery, 1, 100),
  ]);
  if (!profile || !data) return null;

  const items = data.items;
  const total = data.total_count;

  const mergedInSample = items.filter((pr) => pr.pull_request?.merged_at).length;
  const openInSample = items.filter((pr) => pr.state === 'open').length;
  const closedInSample = items.filter(
    (pr) => !pr.pull_request?.merged_at && pr.state === 'closed'
  ).length;

  const sampleSize = items.length || 1;
  const scale = total / sampleSize;

  return {
    profile,
    mentor: student.mentor,
    totalPRs: total,
    mergedPRs: Math.round(mergedInSample * scale),
    openPRs: Math.round(openInSample * scale),
    closedPRs: Math.round(closedInSample * scale),
  };
}

export async function getAllStudentSummaries(dateQuery = ''): Promise<StudentSummary[]> {
  const students = getStudents();
  if (students.length === 0) return [];

  const results: StudentSummary[] = [];
  const batchSize = 5;

  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((s) => getStudentSummary(s, dateQuery)));
    results.push(...batchResults.filter((r): r is StudentSummary => r !== null));
    if (i + batchSize < students.length) {
      await new Promise((res) => setTimeout(res, 800));
    }
  }

  return results.sort((a, b) => b.totalPRs - a.totalPRs);
}

export function repoFromUrl(repoUrl: string): string {
  return repoUrl.replace('https://api.github.com/repos/', '');
}

export function buildDateQuery(period: string, from?: string, to?: string): string {
  const toISO = (d: Date) => d.toISOString().split('T')[0];
  const ago = (days: number) => toISO(new Date(Date.now() - days * 86_400_000));
  switch (period) {
    case '1day':    return `created:>${ago(1)}`;
    case 'week':    return `created:>${ago(7)}`;
    case 'month':   return `created:>${ago(30)}`;
    case '3months': return `created:>${ago(90)}`;
    case '6months': return `created:>${ago(180)}`;
    case 'year':    return `created:>${ago(365)}`;
    case 'custom':
      if (from && to)  return `created:${from}..${to}`;
      if (from)        return `created:>${from}`;
      return '';
    default: return '';
  }
}
