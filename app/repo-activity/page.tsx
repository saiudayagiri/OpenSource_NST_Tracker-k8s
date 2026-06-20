'use client';

import { useState, useEffect } from 'react';

interface Contributor {
  username: string;
  avatarUrl: string;
  prsCount: number;
  issuesCount: number;
  prs: Array<{ number: number; title: string; url: string; state: string; createdAt: string }>;
  issues: Array<{ number: number; title: string; url: string; state: string; createdAt: string }>;
}

interface RepoInfo {
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  url: string;
}

export default function RepoActivityPage() {
  const [repoInput, setRepoInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'prs' | 'issues'>('all');
  const [period, setPeriod] = useState<'all' | '1day' | 'week' | 'month' | '2months' | '3months'>('all');
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  // Fetch session on mount to check authentication state
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  // Trigger search on period change if a repository has already been searched
  useEffect(() => {
    if (repoInfo) {
      const parsed = parseRepoInput(repoInput);
      if (parsed) {
        setLoading(true);
        setError('');
        setExpandedUser(null);
        fetch(`/api/repo-activity?repo=${encodeURIComponent(parsed)}&period=${period}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.error) setError(data.error);
            else {
              setRepoInfo(data.repoInfo);
              setContributors(data.contributors);
            }
          })
          .catch(() => setError('A network error occurred.'))
          .finally(() => setLoading(false));
      }
    }
  }, [period]);

  function parseRepoInput(input: string): string | null {
    const clean = input.trim().replace(/\/$/, '');
    // Regex matches:
    // https://github.com/owner/repo
    // git@github.com:owner/repo.git
    // owner/repo
    const regex = /(?:github\.com\/|github\.com:)?([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\.git)?$/i;
    const match = clean.match(regex);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
    return null;
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseRepoInput(repoInput);
    if (!parsed) {
      setError('Invalid format. Please enter a repository path (owner/repo) or full GitHub URL.');
      return;
    }

    setLoading(true);
    setError('');
    setRepoInfo(null);
    setContributors([]);
    setExpandedUser(null);

    try {
      const res = await fetch(`/api/repo-activity?repo=${encodeURIComponent(parsed)}&period=${period}`);
      const data = await res.json();

      if (res.ok) {
        setRepoInfo(data.repoInfo);
        setContributors(data.contributors);
      } else {
        setError(data.error ?? 'Failed to fetch repository activity.');
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Filter contributors based on selected type
  const activeContributors = contributors.filter((c) => {
    if (filterType === 'prs') return c.prsCount > 0;
    if (filterType === 'issues') return c.issuesCount > 0;
    return c.prsCount > 0 || c.issuesCount > 0;
  });

  // Sort contributors dynamically based on selection
  const sortedContributors = [...activeContributors].sort((a, b) => {
    if (filterType === 'prs') {
      return b.prsCount - a.prsCount;
    }
    if (filterType === 'issues') {
      return b.issuesCount - a.issuesCount;
    }
    const totalA = a.prsCount + a.issuesCount;
    const totalB = b.prsCount + b.issuesCount;
    if (totalB !== totalA) return totalB - totalA;
    return b.prsCount - a.prsCount; // tiebreaker: prs first
  });

  const maxActivity = Math.max(
    ...contributors.map((c) => {
      if (filterType === 'prs') return c.prsCount;
      if (filterType === 'issues') return c.issuesCount;
      return c.prsCount + c.issuesCount;
    }),
    1
  );

  return (
    <main className="min-h-screen bg-[#0d0d14] text-white py-12 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/25 rounded-full px-4 py-1.5 text-xs font-semibold text-purple-300 mb-4">
            🔥 Sandbox Competition Tracker
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Repository{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Activity Tracker
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-3 max-w-lg mx-auto leading-relaxed">
            Enter any public GitHub repository link to inspect contributors, active pull requests, issues, and see the competition.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-10 max-w-2xl mx-auto">
          <input
            type="text"
            required
            placeholder="e.g. facebook/react or https://github.com/vercel/next.js"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl px-5 py-3.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] transition-all"
          />
          <button
            type="submit"
            disabled={loading || !repoInput.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:-translate-y-0.5 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Scanning…
              </>
            ) : (
              'Scan Repository'
            )}
          </button>
        </form>

        {/* Period Filter (Always Visible) */}
        <div className="flex flex-col items-center justify-center gap-3 mb-10 max-w-2xl mx-auto">
          <span className="text-xs font-semibold text-white/45 uppercase tracking-wider">
            Time Period Filter
          </span>
          <div className="flex bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 shrink-0">
            {([
              { id: 'all',     label: 'All Time' },
              { id: '1day',    label: '24h' },
              { id: 'week',    label: 'Week' },
              { id: 'month',   label: 'Month' },
              { id: '2months', label: '2 Months' },
              { id: '3months', label: '3 Months' },
            ] as const).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  period === p.id
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-white/45 hover:text-white/65'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sign In Banner if not authenticated */}
        {authenticated === false && (
          <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-transparent border border-purple-500/20 rounded-2xl p-4 text-purple-300 text-sm max-w-2xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse flex-shrink-0" />
              <span>
                <strong>Rate Limit Warning:</strong> You are currently unauthenticated. Sign in to GitHub to use your high personal search limit (5,000 req/hr).
              </span>
            </div>
            <a
              href="/api/auth/github"
              className="bg-[#24292e] border border-white/[0.08] hover:bg-[#2f363d] hover:border-white/[0.15] text-white px-3.5 py-1.5 rounded-xl transition-all text-xs font-semibold shadow-md active:scale-95 shrink-0"
            >
              Sign In with GitHub
            </a>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 text-red-400 text-sm max-w-2xl mx-auto mb-10 flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <p className="leading-snug">{error}</p>
          </div>
        )}

        {/* Results */}
        {repoInfo && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Repo Info Card */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-md">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <a
                    href={repoInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl font-bold text-white hover:text-purple-400 transition-colors flex items-center gap-2"
                  >
                    {repoInfo.fullName}
                    <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  {repoInfo.description && (
                    <p className="text-white/50 text-sm mt-1.5 leading-relaxed max-w-2xl">{repoInfo.description}</p>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/[0.05]">
                {[
                  { label: 'Stars', value: repoInfo.stars.toLocaleString(), icon: '⭐️' },
                  { label: 'Forks', value: repoInfo.forks.toLocaleString(), icon: '🍴' },
                  { label: 'Open Issues', value: repoInfo.openIssues.toLocaleString(), icon: '🔧' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-center">
                    <div className="text-white/40 text-xs mb-1 font-mono uppercase tracking-wider flex items-center justify-center gap-1">
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                    </div>
                    <div className="text-lg md:text-xl font-bold text-white tabular-nums">{s.value}</div>
                  </div>
                ))}
              </div>
                 {/* Leaderboard Section */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Contributor Competition</h2>
                  <p className="text-white/35 text-xs mt-0.5">Rankings based on active contributions in the selected period.</p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {/* Filter Tabs */}
                  <div className="flex bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 shrink-0">
                    {([
                      { id: 'all',    label: 'All Activity' },
                      { id: 'prs',    label: 'PRs' },
                      { id: 'issues', label: 'Issues' },
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setFilterType(t.id);
                          setExpandedUser(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          filterType === t.id
                            ? 'bg-white/[0.07] text-white shadow-sm'
                            : 'text-white/45 hover:text-white/65'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leaderboard Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedContributors.map((c, index) => {
                  const isExpanded = expandedUser === c.username;
                  const score =
                    filterType === 'prs'
                      ? c.prsCount
                      : filterType === 'issues'
                      ? c.issuesCount
                      : c.prsCount + c.issuesCount;

                  const widthPercent = (score / maxActivity) * 100;

                  // Gold, Silver, Bronze styling
                  const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                  const rankBg =
                    index === 0
                      ? 'bg-yellow-500/10 border-yellow-500/25 text-yellow-300'
                      : index === 1
                      ? 'bg-slate-400/10 border-slate-400/25 text-slate-300'
                      : index === 2
                      ? 'bg-amber-600/10 border-amber-600/25 text-amber-500'
                      : 'bg-white/[0.03] border-white/[0.08] text-white/50';

                  return (
                    <div
                      key={c.username}
                      className={`group border rounded-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                        isExpanded
                          ? 'bg-white/[0.05] border-purple-500/40 shadow-xl shadow-purple-900/15'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.035] hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/25'
                      }`}
                    >
                      {/* Top Rank Badge & Avatar Info */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={c.avatarUrl}
                              alt={c.username}
                              className="w-12 h-12 rounded-full ring-2 ring-white/10 group-hover:ring-purple-500/30 transition-all object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-white/90 font-bold block truncate text-base">
                                @{c.username}
                              </span>
                              <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
                                Rank #{index + 1}
                              </span>
                            </div>
                          </div>

                          <div className={`w-8 h-8 rounded-xl border text-sm font-bold font-mono flex items-center justify-center shrink-0 ${rankBg}`}>
                            {rankIcon ? rankIcon : index + 1}
                          </div>
                        </div>

                        {/* Activity stats strip */}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-white/[0.015] border border-white/[0.04] rounded-xl p-2.5 text-center">
                            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider mb-0.5">PRs</div>
                            <div className="text-base font-bold text-emerald-400 font-mono">{c.prsCount}</div>
                          </div>
                          <div className="bg-white/[0.015] border border-white/[0.04] rounded-xl p-2.5 text-center">
                            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider mb-0.5">Issues</div>
                            <div className="text-base font-bold text-purple-400 font-mono">{c.issuesCount}</div>
                          </div>
                        </div>

                        {/* Progress Visual */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-white/25">
                            <span>Contribution share</span>
                            <span>{Math.round(widthPercent)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${widthPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expand Action Button */}
                      <button
                        type="button"
                        onClick={() => setExpandedUser(isExpanded ? null : c.username)}
                        className={`w-full py-2.5 border-t text-xs font-semibold flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer ${
                          isExpanded
                            ? 'bg-purple-600/10 border-purple-500/30 text-purple-400 hover:bg-purple-600/15'
                            : 'bg-white/[0.01] border-white/[0.06] text-white/45 hover:text-white/75 hover:bg-white/[0.03]'
                        }`}
                      >
                        <span>{isExpanded ? 'Hide Recent Work' : 'Show Recent Work'}</span>
                        <svg
                          className={`w-3.5 h-3.5 transition-all ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Expanded Details inside Card */}
                      {isExpanded && (
                        <div className="border-t border-white/[0.05] bg-black/30 p-4 space-y-4 max-h-64 overflow-y-auto scrollbar-thin animate-in fade-in duration-200">
                          {/* Pull Requests list */}
                          {c.prs.length > 0 && (
                            <div>
                              <h4 className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mb-2 font-mono">Pull Requests</h4>
                              <div className="space-y-1.5">
                                {c.prs.map((pr) => (
                                  <a
                                    key={pr.number}
                                    href={pr.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all text-[11px] text-white/70 hover:text-white font-sans"
                                  >
                                    <span className="font-medium truncate">
                                      <span className="text-white/20 mr-1">#{pr.number}</span>
                                      {pr.title}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border shrink-0 ${
                                      pr.state === 'open'
                                        ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                                        : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                    }`}>
                                      {pr.state}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Issues list */}
                          {c.issues.length > 0 && (
                            <div>
                              <h4 className="text-[9px] text-purple-400 font-bold uppercase tracking-wider mb-2 font-mono">Issues</h4>
                              <div className="space-y-1.5">
                                {c.issues.map((issue) => (
                                  <a
                                    key={issue.number}
                                    href={issue.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all text-[11px] text-white/70 hover:text-white font-sans"
                                  >
                                    <span className="font-medium truncate">
                                      <span className="text-white/20 mr-1">#{issue.number}</span>
                                      {issue.title}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border shrink-0 ${
                                      issue.state === 'open'
                                        ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                                        : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                    }`}>
                                      {issue.state}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {sortedContributors.length === 0 && (
                  <div className="text-center py-16 bg-white/[0.01] border border-white/[0.04] rounded-3xl text-white/20 col-span-full">
                    <div className="text-3xl mb-2">📭</div>
                    <p className="text-sm font-medium">No activity found for this category</p>
                    <p className="text-xs text-white/10 mt-1">Try toggling to &quot;All Activity&quot; or scan another repository.</p>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        )}

        {/* Scanning Empty State */}
        {!repoInfo && !loading && !error && (
          <div className="text-center py-20 text-white/20 border border-white/[0.04] bg-white/[0.01] rounded-3xl animate-in fade-in duration-300">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-30 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-base font-semibold text-white/40 mb-1">No repository scanned yet</p>
            <p className="text-sm leading-relaxed max-w-sm mx-auto">
              Paste a repository link above to view contributor competition rankings, recent PRs, and issues.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
