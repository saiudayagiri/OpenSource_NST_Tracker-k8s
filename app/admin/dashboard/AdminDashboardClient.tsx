'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { FlaggedPR, FlagReason } from '@/lib/flagged';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawPR {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  repository_url: string;
  created_at: string;
  pull_request?: { merged_at: string | null; html_url: string };
  user: { login: string; avatar_url: string };
}

interface PRWithMeta extends RawPR {
  prKey: string;
  repo: string;
  isMerged: boolean;
  flagged?: FlaggedPR;
  approved?: boolean;
}

const REASON_LABELS: Record<FlagReason, { label: string; color: string; bg: string; border: string }> = {
  fake:        { label: 'Fake PR',     color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/25' },
  self_pr:     { label: 'Self PR',     color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/25' },
  low_quality: { label: 'Low Quality', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/25' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function repoFromUrl(url: string) {
  return url.replace('https://api.github.com/repos/', '');
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Fetches ALL PRs for a user, paginating through every page (up to 1000) */
async function fetchPRsForUser(username: string): Promise<RawPR[]> {
  const all: RawPR[] = [];
  let page = 1;
  const maxPages = 10; // 10 × 100 = up to 1000 PRs per user

  while (page <= maxPages) {
    const res = await fetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(`is:pr author:${username} -user:${username}`)}&sort=created&order=desc&per_page=100&page=${page}`,
      { cache: 'no-store' }
    );
    if (!res.ok) break;
    const data = await res.json();
    const items: RawPR[] = data.items ?? [];
    all.push(...items);
    // Stop if we've got everything
    if (all.length >= data.total_count || items.length < 100) break;
    page++;
  }

  return all;
}


// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ pr }: { pr: PRWithMeta }) {
  if (pr.isMerged)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/25 whitespace-nowrap">Merged</span>;
  if (pr.state === 'open')
    return <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/25 whitespace-nowrap">Open</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.05] text-white/30 border border-white/10 whitespace-nowrap">Closed</span>;
}

function FlagBadge({ flag }: { flag: FlaggedPR }) {
  const meta = REASON_LABELS[flag.reason];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${meta.bg} ${meta.color} ${meta.border}`}>
      ⚑ {meta.label}
    </span>
  );
}

// ─── Flag modal ───────────────────────────────────────────────────────────────

interface FlagModalProps {
  pr: PRWithMeta;
  onClose: () => void;
  onFlagged: (pr: PRWithMeta, reason: FlagReason, note: string) => void;
}

function FlagModal({ pr, onClose, onFlagged }: FlagModalProps) {
  const [reason, setReason] = useState<FlagReason>('fake');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch('/api/admin/flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: pr.prKey,
        url: pr.pull_request?.html_url ?? pr.html_url,
        title: pr.title,
        author: pr.user.login,
        reason,
        note: note.trim() || undefined,
      }),
    });
    setLoading(false);
    if (res.ok) {
      onFlagged(pr, reason, note);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#13131f] border border-white/[0.1] rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-white font-semibold text-lg mb-1">Flag PR</h3>
        <p className="text-white/35 text-sm mb-5 leading-relaxed truncate" title={pr.title}>{pr.title}</p>

        <div className="space-y-3 mb-5">
          {(Object.entries(REASON_LABELS) as [FlagReason, typeof REASON_LABELS[FlagReason]][]).map(([key, meta]) => (
            <label key={key} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              reason === key ? `${meta.bg} ${meta.border}` : 'bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.04]'
            }`}>
              <input type="radio" name="flag-reason" value={key} checked={reason === key} onChange={() => setReason(key)} className="accent-purple-500" />
              <div>
                <div className={`font-medium text-sm ${reason === key ? meta.color : 'text-white/60'}`}>{meta.label}</div>
                <div className="text-white/25 text-xs">
                  {key === 'fake' && 'PR is completely fake or spam'}
                  {key === 'self_pr' && "Merged to contributor's own repository"}
                  {key === 'low_quality' && 'Trivial change not worthy of contribution credit'}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="mb-5">
          <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Note (optional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Admin note…" rows={2}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-purple-500/40 resize-none" />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-all text-sm font-medium">
            Cancel
          </button>
          <button onClick={submit} disabled={loading} id="confirm-flag-btn"
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600/80 to-orange-600/80 hover:from-red-500/80 hover:to-orange-500/80 text-white font-semibold transition-all text-sm disabled:opacity-50 shadow-lg shadow-red-900/20">
            {loading ? 'Flagging…' : '⚑ Flag PR'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PR Row (shared between Queue and Browse) ────────────────────────────────

interface PRRowProps {
  pr: PRWithMeta;
  showAuthor?: boolean;
  onApprove?: (pr: PRWithMeta) => void;
  onFlag: (pr: PRWithMeta) => void;
  onUnflag?: (prKey: string) => void;
  onUnapprove?: (pr: PRWithMeta) => void;
}

function PRRow({ pr, showAuthor, onApprove, onFlag, onUnflag, onUnapprove }: PRRowProps) {
  return (
    <div className={`group flex items-start gap-3 rounded-xl p-4 border transition-all ${
      pr.flagged ? 'bg-red-500/[0.04] border-red-500/[0.15]'
      : pr.approved ? 'bg-emerald-500/[0.03] border-emerald-500/[0.12]'
      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
    }`}>
      <img src={pr.user.avatar_url} alt={pr.user.login} className="w-7 h-7 rounded-full flex-shrink-0 opacity-70 mt-0.5" />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <a href={pr.pull_request?.html_url ?? pr.html_url} target="_blank" rel="noopener noreferrer"
            className="text-white/80 font-medium hover:text-white transition-colors text-sm leading-snug">
            {pr.title}
          </a>
          <span className="text-white/20 text-xs tabular-nums">#{pr.number}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {showAuthor && <span className="text-purple-400/70 text-xs font-medium">@{pr.user.login}</span>}
          <span className="text-white/25 text-xs font-mono truncate max-w-[180px]">{pr.repo}</span>
          <span className="text-white/15 text-xs">·</span>
          <span className="text-white/25 text-xs">{formatDate(pr.created_at)}</span>
          <StatusBadge pr={pr} />
          {pr.flagged && <FlagBadge flag={pr.flagged} />}
          {pr.approved && !pr.flagged && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">✓ Approved</span>
          )}
        </div>
        {pr.flagged?.note && <p className="text-white/30 text-xs mt-1 italic">Note: {pr.flagged.note}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
        {pr.flagged ? (
          onUnflag && (
            <button onClick={() => onUnflag(pr.prKey)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all">
              Unflag
            </button>
          )
        ) : pr.approved ? (
          onUnapprove && (
            <button onClick={() => onUnapprove(pr)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 transition-all opacity-0 group-hover:opacity-100">
              Undo
            </button>
          )
        ) : (
          <>
            {onApprove && (
              <button onClick={() => onApprove(pr)}
                title="Looks good — approve"
                className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all opacity-0 group-hover:opacity-100">
                ✓ Approve
              </button>
            )}
            <button onClick={() => onFlag(pr)}
              title="Flag this PR"
              className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100">
              ⚑ Flag
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Queue Tab ────────────────────────────────────────────────────────────────

interface QueueTabProps {
  students: string[];
  reviewedIds: Set<string>;
  flaggedMap: Map<string, FlaggedPR>;
  onFlag: (pr: PRWithMeta) => void;
  onApprove: (pr: PRWithMeta) => void;
  onUnapprove: (pr: PRWithMeta) => void;
  onUnflag: (prKey: string) => void;
  queuePRs: PRWithMeta[];
  setQueuePRs: React.Dispatch<React.SetStateAction<PRWithMeta[]>>;
}

function QueueTab({ students, reviewedIds, flaggedMap, onFlag, onApprove, onUnapprove, onUnflag, queuePRs, setQueuePRs }: QueueTabProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [queueFilter, setQueueFilter] = useState<'pending' | 'all'>('pending');

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError('');
    setProgress({ done: 0, total: students.length });
    const all: PRWithMeta[] = [];

    for (let i = 0; i < students.length; i++) {
      const username = students[i];
      try {
        const raw = await fetchPRsForUser(username);
        const mapped: PRWithMeta[] = raw.map((pr) => {
          const repo = repoFromUrl(pr.repository_url);
          const prKey = `${repo}#${pr.number}`;
          return {
            ...pr,
            prKey,
            repo,
            isMerged: !!pr.pull_request?.merged_at,
            flagged: flaggedMap.get(prKey),
            approved: reviewedIds.has(prKey) && !flaggedMap.has(prKey),
          };
        });
        all.push(...mapped);
      } catch {
        // skip user on error
      }
      setProgress({ done: i + 1, total: students.length });
    }

    // Sort: pending first → approved → flagged, newest within each group
    all.sort((a, b) => {
      const priority = (pr: PRWithMeta) =>
        pr.flagged ? 2 : pr.approved ? 1 : 0;
      const pa = priority(a), pb = priority(b);
      if (pa !== pb) return pa - pb;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setQueuePRs(all);
    setLoaded(true);
    setLoading(false);
  }, [students, reviewedIds, flaggedMap, setQueuePRs]);

  const pendingPRs = queuePRs.filter((pr) => !pr.approved && !pr.flagged);
  const displayPRs = queueFilter === 'pending' ? pendingPRs : queuePRs;

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-white font-semibold">PR Review Queue</h2>
          <p className="text-white/35 text-sm mt-0.5">
            All contributor PRs — approve clean ones, flag bad ones.
          </p>
        </div>
        <button
          id="load-queue-btn"
          onClick={loadQueue}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {progress.done}/{progress.total}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loaded ? 'Refresh Queue' : 'Load Queue'}
            </>
          )}
        </button>
      </div>

      {/* Progress bar */}
      {loading && (
        <div className="mb-6">
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
          <p className="text-white/25 text-xs mt-2">Fetching PRs from GitHub… ({progress.done}/{progress.total} contributors)</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-red-400 text-sm mb-6">{error}</div>
      )}

      {/* Stats strip */}
      {loaded && !loading && (
        <div className="flex flex-wrap gap-3 mb-5">
          {[
            { label: 'Pending Review', value: pendingPRs.length, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
            { label: 'Approved', value: queuePRs.filter(p => p.approved).length, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { label: 'Flagged', value: queuePRs.filter(p => p.flagged).length, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
            { label: 'Total PRs', value: queuePRs.length, color: 'text-white/50', bg: 'bg-white/[0.04]', border: 'border-white/[0.08]' },
          ].map((s) => (
            <div key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${s.bg} ${s.border}`}>
              <span className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</span>
              <span className="text-white/35 text-xs">{s.label}</span>
            </div>
          ))}

          {/* Filter toggle */}
          <div className="flex gap-1 ml-auto bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
            {(['pending', 'all'] as const).map((f) => (
              <button key={f} onClick={() => setQueueFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  queueFilter === f ? 'bg-white/[0.08] text-white' : 'text-white/35 hover:text-white/55'
                }`}>
                {f === 'pending' ? `⏳ Pending (${pendingPRs.length})` : `All (${queuePRs.length})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loaded && !loading && (
        <div className="text-center py-24 text-white/20">
          <div className="text-5xl mb-4">📥</div>
          <p className="text-base font-medium text-white/30 mb-1">Queue not loaded yet</p>
          <p className="text-sm">Click "Load Queue" to fetch all contributor PRs</p>
        </div>
      )}

      {loaded && !loading && displayPRs.length === 0 && (
        <div className="text-center py-24 text-white/20">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-base font-medium text-white/35 mb-1">All caught up!</p>
          <p className="text-sm">No pending PRs to review</p>
        </div>
      )}

      {/* PR list */}
      <div className="space-y-2">
        {displayPRs.map((pr) => (
          <PRRow
            key={pr.prKey}
            pr={pr}
            showAuthor
            onApprove={onApprove}
            onFlag={onFlag}
            onUnflag={onUnflag}
            onUnapprove={onUnapprove}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

interface Props {
  flaggedPRs: FlaggedPR[];
  reviewedPRIds: string[];
  students: string[];
}

type DashboardTab = 'queue' | 'browse' | 'flagged';

export default function AdminDashboardClient({ flaggedPRs: initialFlagged, reviewedPRIds: initialReviewed, students }: Props) {
  const router = useRouter();

  const [tab, setTab] = useState<DashboardTab>('queue');
  const [selectedUser, setSelectedUser] = useState(students[0] ?? '');
  const [searchQuery, setSearchQuery] = useState(students[0] ?? '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [browsePRs, setBrowsePRs] = useState<PRWithMeta[]>([]);
  const [queuePRs, setQueuePRs] = useState<PRWithMeta[]>([]);
  const [flaggedMap, setFlaggedMap] = useState<Map<string, FlaggedPR>>(
    () => new Map(initialFlagged.map((f) => [f.id, f]))
  );
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(
    () => new Set(initialReviewed)
  );
  const [allFlagged, setAllFlagged] = useState<FlaggedPR[]>(initialFlagged);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState('');
  const [modalPR, setModalPR] = useState<PRWithMeta | null>(null);
  const [browseFilter, setBrowseFilter] = useState<'all' | 'flagged' | 'clean'>('all');
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Sync search input query with selected contributor
  useEffect(() => {
    setSearchQuery(selectedUser);
  }, [selectedUser]);

  // Pending count for tab badge
  const pendingCount = queuePRs.filter((pr) => !pr.approved && !pr.flagged).length;

  const applyMeta = useCallback((prs: PRWithMeta[]) =>
    prs.map((pr) => ({
      ...pr,
      flagged: flaggedMap.get(pr.prKey),
      approved: reviewedIds.has(pr.prKey) && !flaggedMap.has(pr.prKey),
    })), [flaggedMap, reviewedIds]);

  // Keep queue PRs in sync when flaggedMap/reviewedIds change
  useEffect(() => {
    setQueuePRs((prev) => applyMeta(prev));
  }, [flaggedMap, reviewedIds, applyMeta]);

  // ── Shared actions ──

  function handleFlagged(pr: PRWithMeta, reason: FlagReason, note: string) {
    const entry: FlaggedPR = {
      id: pr.prKey,
      url: pr.pull_request?.html_url ?? pr.html_url,
      title: pr.title,
      author: pr.user.login,
      reason,
      note: note.trim() || undefined,
      flaggedAt: new Date().toISOString(),
    };
    setFlaggedMap((prev) => new Map(prev).set(pr.prKey, entry));
    setReviewedIds((prev) => new Set([...prev, pr.prKey]));
    setAllFlagged((prev) => [...prev.filter((f) => f.id !== pr.prKey), entry]);
    setBrowsePRs((prev) => applyMeta(prev));
  }

  async function handleApprove(pr: PRWithMeta) {
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: pr.prKey }),
    });
    if (res.ok) {
      setReviewedIds((prev) => new Set([...prev, pr.prKey]));
    }
  }

  async function handleUnapprove(pr: PRWithMeta) {
    const res = await fetch(`/api/admin/approve?id=${encodeURIComponent(pr.prKey)}`, { method: 'DELETE' });
    if (res.ok) {
      setReviewedIds((prev) => { const s = new Set(prev); s.delete(pr.prKey); return s; });
    }
  }

  async function handleUnflag(prKey: string) {
    const res = await fetch(`/api/admin/flag?id=${encodeURIComponent(prKey)}`, { method: 'DELETE' });
    if (res.ok) {
      setFlaggedMap((prev) => { const m = new Map(prev); m.delete(prKey); return m; });
      setReviewedIds((prev) => { const s = new Set(prev); s.delete(prKey); return s; });
      setAllFlagged((prev) => prev.filter((f) => f.id !== prKey));
    }
  }

  async function fetchBrowsePRs(username: string) {
    if (!username) return;
    setBrowseLoading(true);
    setBrowseError('');
    setBrowsePRs([]);
    try {
      const raw = await fetchPRsForUser(username);
      if (raw.length === 0 && username) {
        setBrowseError('No PRs found or GitHub rate limit hit.');
      }
      const mapped: PRWithMeta[] = raw.map((pr) => {
        const repo = repoFromUrl(pr.repository_url);
        const prKey = `${repo}#${pr.number}`;
        return { ...pr, prKey, repo, isMerged: !!pr.pull_request?.merged_at, flagged: flaggedMap.get(prKey), approved: reviewedIds.has(prKey) && !flaggedMap.has(prKey) };
      });
      setBrowsePRs(mapped);
    } catch {
      setBrowseError('Network error while fetching PRs.');
    } finally {
      setBrowseLoading(false);
    }
  }

  async function handleLogout() {
    setLogoutLoading(true);
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin');
  }

  const displayedBrowsePRs = browsePRs.filter((pr) => {
    if (browseFilter === 'flagged') return !!pr.flagged;
    if (browseFilter === 'clean') return !pr.flagged;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#0d0d14]">
      {/* Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/6 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/[0.07] bg-[#0d0d14]/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm">Admin Dashboard</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/25 text-xs hidden sm:inline">{allFlagged.length} flagged</span>
            <button onClick={handleLogout} disabled={logoutLoading} id="admin-logout-btn"
              className="text-white/40 hover:text-white/70 text-sm px-3 py-1.5 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {logoutLoading ? 'Logging out…' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 w-fit">
          {([
            { id: 'queue',   label: '📥 Queue', badge: pendingCount > 0 ? pendingCount : null },
            { id: 'browse',  label: '🔍 Browse', badge: null },
            { id: 'flagged', label: '⚑ Flagged', badge: allFlagged.length > 0 ? allFlagged.length : null },
          ] as const).map(({ id, label, badge }) => (
            <button key={id} id={`tab-${id}`} onClick={() => setTab(id)}
              className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id ? 'bg-white/[0.08] text-white border border-white/[0.12]' : 'text-white/40 hover:text-white/60'
              }`}>
              {label}
              {badge !== null && (
                <span className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  id === 'queue' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Queue Tab ── */}
        {tab === 'queue' && (
          <QueueTab
            students={students}
            reviewedIds={reviewedIds}
            flaggedMap={flaggedMap}
            onFlag={(pr) => setModalPR(pr)}
            onApprove={handleApprove}
            onUnapprove={handleUnapprove}
            onUnflag={handleUnflag}
            queuePRs={queuePRs}
            setQueuePRs={setQueuePRs}
          />
        )}

        {/* ── Browse Tab ── */}
        {tab === 'browse' && (
          <div>
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-white/35 mb-1.5 uppercase tracking-wider">Select contributor</label>
                <div className="relative">
                  <input
                    type="text"
                    id="user-select-search"
                    placeholder="Search and select contributor..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40 cursor-text"
                  />
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="absolute right-3 top-3 text-white/30 hover:text-white/60 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-[#13131f] border border-white/[0.15] rounded-xl shadow-2xl z-20 scrollbar-thin">
                        {students.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                          students
                            .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((s) => (
                              <div
                                key={s}
                                onClick={() => {
                                  setSelectedUser(s);
                                  setSearchQuery(s);
                                  setIsDropdownOpen(false);
                                }}
                                className={`px-4 py-2.5 text-sm text-white/80 cursor-pointer hover:bg-white/[0.06] hover:text-white transition-all ${
                                  selectedUser === s ? 'bg-purple-500/20 text-purple-300 font-medium' : ''
                                }`}
                              >
                                {s}
                              </div>
                            ))
                        ) : (
                          <div className="px-4 py-3 text-xs text-white/25 text-center">No contributors match search</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-end">
                <button id="load-prs-btn" onClick={() => fetchBrowsePRs(selectedUser)} disabled={browseLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2 text-sm">
                  {browseLoading ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Loading…</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Load PRs</>
                  )}
                </button>
              </div>
              {browsePRs.length > 0 && (
                <div className="flex items-end gap-1">
                  {(['all', 'clean', 'flagged'] as const).map((f) => (
                    <button key={f} onClick={() => setBrowseFilter(f)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all capitalize ${
                        browseFilter === f ? 'bg-white/[0.08] text-white border-white/[0.15]' : 'bg-white/[0.02] text-white/35 border-white/[0.07] hover:text-white/55'
                      }`}>
                      {f === 'all' ? `All (${browsePRs.length})` : f === 'flagged' ? `Flagged (${browsePRs.filter(p => p.flagged).length})` : `Clean (${browsePRs.filter(p => !p.flagged).length})`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {browseError && <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-red-400 text-sm mb-6">{browseError}</div>}

            {!browseLoading && browsePRs.length === 0 && !browseError && (
              <div className="text-center py-20 text-white/20">
                <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Select a contributor and click "Load PRs"
              </div>
            )}

            {browseLoading && (
              <div className="text-center py-20 text-white/25 flex flex-col items-center gap-3">
                <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Fetching PRs from GitHub…
              </div>
            )}

            <div className="space-y-2">
              {displayedBrowsePRs.map((pr) => (
                <PRRow key={pr.prKey} pr={pr}
                  onApprove={handleApprove}
                  onFlag={(p) => setModalPR(p)}
                  onUnflag={handleUnflag}
                  onUnapprove={handleUnapprove}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Flagged Tab ── */}
        {tab === 'flagged' && (
          <div>
            <p className="text-white/35 text-sm mb-6">These PRs are excluded from contribution counts across all views.</p>

            {allFlagged.length === 0 ? (
              <div className="text-center py-20 text-white/20">
                <div className="text-5xl mb-3">🏳️</div>
                <p>No flagged PRs yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allFlagged.map((flag) => {
                  const meta = REASON_LABELS[flag.reason];
                  return (
                    <div key={flag.id} className="flex items-start gap-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.035] transition-all">
                      <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full border font-medium ${meta.bg} ${meta.color} ${meta.border}`}>
                        {meta.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <a href={flag.url} target="_blank" rel="noopener noreferrer"
                          className="text-white/75 text-sm font-medium hover:text-white transition-colors block">{flag.title}</a>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-white/25 text-xs">@{flag.author}</span>
                          <span className="text-white/15 text-xs">·</span>
                          <span className="text-white/20 text-xs font-mono">{flag.id}</span>
                          <span className="text-white/15 text-xs">·</span>
                          <span className="text-white/20 text-xs">{formatDate(flag.flaggedAt)}</span>
                        </div>
                        {flag.note && <p className="text-white/30 text-xs mt-1 italic">"{flag.note}"</p>}
                      </div>
                      <button onClick={() => handleUnflag(flag.id)}
                        className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/35 hover:text-white/65 hover:bg-white/[0.07] transition-all">
                        Unflag
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Flag modal */}
      {modalPR && (
        <FlagModal pr={modalPR} onClose={() => setModalPR(null)} onFlagged={handleFlagged} />
      )}
    </main>
  );
}
