'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  cachedAt: string | null;
  username?: string;
  period?: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return `${diffSecs}s ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function RefreshButton({ cachedAt: initialCachedAt, username, period }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cachedAt, setCachedAt] = useState(initialCachedAt);
  const [label, setLabel] = useState('');
  const [cooldown, setCooldown] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | 'warning'; loginNudge?: boolean } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Sync state if props change
  useEffect(() => {
    setCachedAt(initialCachedAt);
  }, [initialCachedAt]);

  // Check if user is logged in to unlock unlimited refreshes
  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => { if (data.authenticated) setIsLoggedIn(true); setSessionChecked(true); })
      .catch(() => { setSessionChecked(true); });
  }, []);

  // Tick the "X ago" label every 30 seconds
  useEffect(() => {
    function update() {
      if (cachedAt) setLabel(timeAgo(cachedAt));
    }
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [cachedAt]);

  // Auto-clear toast alert after 4 seconds (unless it is loading/info state)
  useEffect(() => {
    if (toast && toast.type !== 'info') {
      const id = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(id);
    }
  }, [toast]);

  async function handleRefresh() {
    setError('');
    setToast({ message: 'Fetching latest data from GitHub...', type: 'info' });
    let url = '/api/refresh';
    if (username) {
      url = `/api/refresh?username=${encodeURIComponent(username)}`;
    } else if (period) {
      url = `/api/refresh?period=${encodeURIComponent(period)}`;
    }

    try {
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      if (data.fromCache) {
        // Logged-in users should never get this — but handle gracefully just in case
        if (!isLoggedIn) {
          setCooldown(true);
          const msg = data.message || 'Data was refreshed recently. Try again in a few minutes.';
          setError(msg);
          setToast({ message: msg, type: 'error', loginNudge: true });
          setTimeout(() => { setCooldown(false); setError(''); }, 8000);
          return;
        }
      }
      if (data.rateLimited) {
        setToast({ message: data.message || 'GitHub rate limit exceeded. Profile queued for update.', type: 'warning' });
        setError(data.message || 'GitHub rate limit exceeded. Profile queued for update.');
        setTimeout(() => { setError(''); }, 8000);
        return;
      }
      if (data.cachedAt) setCachedAt(data.cachedAt);
      setToast({ message: 'Successfully updated leaderboard stats!', type: 'success' });
      // Re-render server components with fresh cache
      startTransition(() => { router.refresh(); });
    } catch {
      setToast({ message: 'Failed to fetch updates. Please try again.', type: 'error' });
    }
  }

  const isLoading = isPending;
  const isDisabled = isLoading || (cooldown && !isLoggedIn);

  return (
    <div className="flex items-center gap-3">
      {/* Last updated label */}
      {cachedAt && (
        <span className="text-white/25 text-xs flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white/20 inline-block" />
          Updated {label}
        </span>
      )}
      {!cachedAt && (
        <span className="text-white/20 text-xs">No cache yet</span>
      )}

      {/* Refresh button — always enabled for logged-in users */}
      <button
        onClick={handleRefresh}
        disabled={isDisabled}
        id="public-refresh-btn"
        title={isLoggedIn ? 'Refresh anytime — you are logged in' : 'Fetch latest data from GitHub'}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
          isDisabled
            ? 'bg-white/[0.02] border-white/[0.06] text-white/20 cursor-not-allowed'
            : isLoggedIn
              ? 'bg-purple-500/10 border-purple-500/25 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40'
              : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.06] hover:border-white/[0.12]'
        }`}
      >
        <svg
          className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {isLoading ? 'Refreshing…' : 'Refresh'}
      </button>

      {/* Logged-in unlock indicator */}
      {isLoggedIn && (
        <span className="text-purple-400/50 text-[10px] font-mono">∞ free</span>
      )}

      {/* Anon login nudge — always visible once session is confirmed not-logged-in */}
      {sessionChecked && !isLoggedIn && (
        <a
          href="/login"
          className="inline-flex items-center gap-1 text-[10px] text-white/25 hover:text-purple-400/70 transition-colors"
          title="Log in with GitHub for unlimited refreshes"
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Log in for unlimited
        </a>
      )}

      {/* Cooldown error (only shows for anonymous users) */}
      {error && !isLoggedIn && (
        <span className="text-yellow-500/60 text-xs">{error}</span>
      )}

      {/* Custom Premium Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/10 bg-[#030712]/90 backdrop-blur-md shadow-2xl text-xs max-w-xs transition-all duration-300">
          {toast.type === 'success' && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
          {toast.type === 'info' && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          )}
          {toast.type === 'error' && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          {toast.type === 'warning' && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
          <span className="text-white/80 font-medium">{toast.message}</span>
          {toast.loginNudge && (
            <a href="/login" className="ml-1 text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors whitespace-nowrap">
              Log in →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
