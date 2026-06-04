'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const PRESETS = [
  { label: 'All',      value: 'all'     },
  { label: '1 Day',    value: '1day'    },
  { label: '1 Week',   value: 'week'    },
  { label: '1 Month',  value: 'month'   },
  { label: '3 Months', value: '3months' },
];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = searchParams.get('period') ?? 'all';
  const searchQuery = searchParams.get('search') ?? '';

  const [showCustom, setShowCustom] = useState(period === 'custom');
  const [from, setFrom] = useState(searchParams.get('from') ?? '');
  const [to, setTo]     = useState(searchParams.get('to')   ?? '');
  const [search, setSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (period !== 'custom') setShowCustom(false);
  }, [period]);

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  function buildParams(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    const cur = { period, from: searchParams.get('from') ?? '', to: searchParams.get('to') ?? '', search };
    const merged = { ...cur, ...overrides };
    if (merged.period && merged.period !== 'all') p.set('period', merged.period);
    if (merged.from) p.set('from', merged.from);
    if (merged.to) p.set('to', merged.to);
    if (merged.search) p.set('search', merged.search);
    return p.toString();
  }

  function navigate(value: string) {
    if (value === 'custom') { setShowCustom(true); return; }
    setShowCustom(false);
    const qs = buildParams({ period: value, from: '', to: '' });
    router.push(qs ? `/contributors?${qs}` : '/contributors');
  }

  function applyCustom() {
    if (!from) return;
    const p = new URLSearchParams({ period: 'custom', from });
    if (to) p.set('to', to);
    if (search) p.set('search', search);
    router.push(`/contributors?${p.toString()}`);
    setShowCustom(false);
  }

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const qs = buildParams({ search: value });
      router.push(qs ? `/contributors?${qs}` : '/contributors');
    }, 350);
  }

  const isCustomActive = period === 'custom';

  return (
    <div className="max-w-6xl mx-auto px-4 pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.09] text-white/70 placeholder-white/20 text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.06] transition-all"
          />
          {search && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-5 w-px bg-white/[0.08]" />

        {/* Preset pills */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map(({ label, value }) => {
            const active = period === value;
            return (
              <button
                key={value}
                onClick={() => navigate(value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  active
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20'
                }`}
              >
                {label}
              </button>
            );
          })}

          {/* Custom pill */}
          <button
            onClick={() => navigate('custom')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              isCustomActive || showCustom
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Custom date inputs */}
      {showCustom && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-white/[0.05] border border-white/[0.12] text-white/70 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500/50 [color-scheme:dark]"
          />
          <span className="text-white/30 text-sm">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            min={from}
            className="bg-white/[0.05] border border-white/[0.12] text-white/70 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500/50 [color-scheme:dark]"
          />
          <button
            onClick={applyCustom}
            disabled={!from}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition-colors"
          >
            Apply
          </button>
          <button
            onClick={() => setShowCustom(false)}
            className="text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Active filter labels */}
      {(period !== 'all' || search) && (
        <p className="text-white/25 text-xs mt-3 flex flex-wrap gap-x-2 items-center">
          {period !== 'all' && (
            <span>
              {period === 'custom'
                ? `Contributions from ${from}${to ? ` to ${to}` : ' onwards'}`
                : `Last ${
                    period === '1day' ? '24 hours' :
                    period === 'week' ? '7 days' :
                    period === 'month' ? '30 days' :
                    '3 months'
                  }`
              }
            </span>
          )}
          {period !== 'all' && search && <span className="text-white/15">·</span>}
          {search && <span>Searching &ldquo;{search}&rdquo;</span>}
          <span className="text-white/15">·</span>
          <button
            onClick={() => { setSearch(''); router.push('/contributors'); }}
            className="underline hover:text-white/50 transition-colors"
          >
            Clear all
          </button>
        </p>
      )}
    </div>
  );
}
