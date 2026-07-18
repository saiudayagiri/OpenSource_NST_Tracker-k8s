'use client';

import { useState } from 'react';
import type { StudentPR, StudentIssue } from '@/lib/github';

const PAGE_SIZE = 30;

function repoFromUrl(url: string): string {
  return url.replace('https://api.github.com/repos/', '');
}

// ─── Status badges ────────────────────────────────────────────────────────────

function PRBadge({ pr }: { pr: StudentPR }) {
  if (pr.pull_request?.merged_at)
    return (
      <span className="inline-flex items-center gap-1.5 bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
        <MergedIcon /> Merged
      </span>
    );
  if (pr.state === 'open')
    return (
      <span className="inline-flex items-center gap-1.5 bg-teal-500/15 text-teal-400 border border-teal-500/25 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
        <OpenIcon /> Open
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 bg-red-500/15 text-red-400 border border-red-500/25 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
      <ClosedIcon /> Closed
    </span>
  );
}

function IssueBadge({ issue }: { issue: StudentIssue }) {
  if (issue.state === 'open')
    return (
      <span className="inline-flex items-center gap-1.5 bg-teal-500/15 text-teal-400 border border-teal-500/25 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
        <IssueOpenIcon /> Open
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
      <IssueClosedIcon /> Closed
    </span>
  );
}

// ─── Tiny SVG icons ────────────────────────────────────────────────────────────

function MergedIcon() {
  return (
    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
      <path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218zm.55-.682a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zM7.5 12.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0zm3.75-2.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" />
    </svg>
  );
}
function OpenIcon() {
  return (
    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854v2.293h.5a3.5 3.5 0 0 1 3.5 3.5v5.372a2.25 2.25 0 1 1-1.5 0V6.647a2 2 0 0 0-2-2H10v2.293a.25.25 0 0 1-.427.177L7.177 4.471a.25.25 0 0 1 0-.354zM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0z" />
    </svg>
  );
}
function ClosedIcon() {
  return (
    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
      <path d="M3.25 1A2.25 2.25 0 0 1 4 5.372v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 3.25 1zm9.5 14a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5zM3.25 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm9.5 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
    </svg>
  );
}
function IssueOpenIcon() {
  return (
    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0z" />
    </svg>
  );
}
function IssueClosedIcon() {
  return (
    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm10.28-1.72-4.5 4.5a.75.75 0 0 1-1.06 0l-2-2a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l1.47 1.47 3.97-3.97a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Labels({ labels }: { labels: Array<{ id: number; name: string; color: string }> }) {
  if (!labels.length) return null;
  return (
    <>
      {labels.slice(0, 4).map((label) => (
        <span
          key={label.id}
          className="text-xs px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: `#${label.color}22`,
            color: `#${label.color}`,
            border: `1px solid #${label.color}44`,
          }}
        >
          {label.name}
        </span>
      ))}
    </>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function ExternalIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 text-white/15 group-hover:text-white/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function RepoHeader({ repo, count }: { repo: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer"
        className="text-white/50 text-sm font-mono hover:text-purple-300 transition-colors flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
        </svg>
        {repo}
      </a>
      <span className="bg-white/[0.06] text-white/30 text-xs px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-center py-16 text-white/25">{text}</div>;
}

/** Groups items by repo, preserving first-seen repo order. */
function groupByRepo<T extends { repository_url: string }>(items: T[]): Map<string, T[]> {
  const byRepo = new Map<string, T[]>();
  for (const item of items) {
    const repo = repoFromUrl(item.repository_url);
    if (!byRepo.has(repo)) byRepo.set(repo, []);
    byRepo.get(repo)!.push(item);
  }
  return byRepo;
}

// ─── Content sections ─────────────────────────────────────────────────────────

export function PRsSection({ prs }: { prs: StudentPR[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (prs.length === 0)
    return <Empty text="No collaborative pull requests found." />;

  const fullCounts = groupByRepo(prs);
  const visibleByRepo = groupByRepo(prs.slice(0, visibleCount));
  const hasMore = visibleCount < prs.length;

  return (
    <div className="space-y-8">
      {Array.from(visibleByRepo.entries()).map(([repo, repoPRs]) => (
        <div key={repo}>
          <RepoHeader repo={repo} count={fullCounts.get(repo)!.length} />
          <div className="space-y-2">
            {repoPRs.map((pr) => (
              <a key={pr.id} href={pr.pull_request?.html_url ?? pr.html_url} target="_blank" rel="noopener noreferrer"
                className="group flex items-start gap-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.045] hover:border-white/[0.1] transition-all">
                <div className="flex-shrink-0 mt-0.5"><PRBadge pr={pr} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-white/85 font-medium group-hover:text-white transition-colors leading-snug">{pr.title}</h3>
                    <span className="text-white/20 text-xs flex-shrink-0 tabular-nums mt-0.5">#{pr.number}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-white/25 text-xs">{formatDate(pr.created_at)}</span>
                    {pr.draft && <span className="text-xs text-white/30 border border-white/10 px-1.5 py-0.5 rounded">Draft</span>}
                    <Labels labels={pr.labels} />
                  </div>
                </div>
                <ExternalIcon />
              </a>
            ))}
          </div>
        </div>
      ))}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-6 py-2.5 rounded-xl text-sm font-medium border border-white/[0.08] bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.12] transition-all"
          >
            Load More ({prs.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

export function IssuesSection({ issues }: { issues: StudentIssue[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (issues.length === 0)
    return <Empty text="No issues found in other repositories." />;

  const fullCounts = groupByRepo(issues);
  const visibleByRepo = groupByRepo(issues.slice(0, visibleCount));
  const hasMore = visibleCount < issues.length;

  return (
    <div className="space-y-8">
      {Array.from(visibleByRepo.entries()).map(([repo, repoIssues]) => (
        <div key={repo}>
          <RepoHeader repo={repo} count={fullCounts.get(repo)!.length} />
          <div className="space-y-2">
            {repoIssues.map((issue) => (
              <a key={issue.id} href={issue.html_url} target="_blank" rel="noopener noreferrer"
                className="group flex items-start gap-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.045] hover:border-white/[0.1] transition-all">
                <div className="flex-shrink-0 mt-0.5"><IssueBadge issue={issue} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-white/85 font-medium group-hover:text-white transition-colors leading-snug">{issue.title}</h3>
                    <span className="text-white/20 text-xs flex-shrink-0 tabular-nums mt-0.5">#{issue.number}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-white/25 text-xs">{formatDate(issue.created_at)}</span>
                    {issue.comments > 0 && (
                      <span className="text-white/25 text-xs flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Z" />
                        </svg>
                        {issue.comments}
                      </span>
                    )}
                    <Labels labels={issue.labels} />
                  </div>
                </div>
                <ExternalIcon />
              </a>
            ))}
          </div>
        </div>
      ))}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-6 py-2.5 rounded-xl text-sm font-medium border border-white/[0.08] bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.12] transition-all"
          >
            Load More ({issues.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
