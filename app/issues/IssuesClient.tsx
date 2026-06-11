'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface IssueStep {
  step: string;
  code: string;
  note?: string;
}

interface Issue {
  id: string;
  emoji: string;
  severity: string;
  title: string;
  tags: string[];
  whatHappened: string;
  whyItHappens: string[];
  solution: IssueStep[];
  preventionTip: string;
}

const SEVERITY_STYLE: Record<string, { label: string; bg: string; border: string; text: string }> = {
  common:          { label: 'Common',        bg: 'bg-orange-500/10', border: 'border-orange-500/25', text: 'text-orange-400' },
  'best-practice': { label: 'Best Practice', bg: 'bg-blue-500/10',   border: 'border-blue-500/25',   text: 'text-blue-400'   },
  critical:        { label: 'Critical',      bg: 'bg-red-500/10',    border: 'border-red-500/25',    text: 'text-red-400'    },
};

export function IssuesClient({ issues }: { issues: Issue[] }) {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');

  const allTags = useMemo(() => {
    const set = new Set(issues.flatMap((i) => i.tags));
    return [...set].sort();
  }, [issues]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return issues.filter((issue) => {
      const matchesSearch =
        !q ||
        issue.title.toLowerCase().includes(q) ||
        issue.tags.some((t) => t.includes(q)) ||
        issue.whatHappened.toLowerCase().includes(q);
      const matchesTag = !activeTag || issue.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [issues, search, activeTag]);

  return (
    <>
      {/* Search bar */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="issues-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues… (e.g. merge conflict, commit)"
            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl pl-10 pr-4 py-3 text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-purple-500/40 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors text-lg leading-none">×</button>
          )}
        </div>

        {/* Tag filter pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => setActiveTag('')}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${
              !activeTag ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' : 'bg-white/[0.03] border-white/[0.08] text-white/30 hover:text-white/50'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                activeTag === tag ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' : 'bg-white/[0.03] border-white/[0.08] text-white/30 hover:text-white/50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      {(search || activeTag) && (
        <div className="max-w-3xl mx-auto px-4 mb-4">
          <p className="text-white/30 text-sm">
            {filtered.length === 0 ? 'No issues matched.' : `${filtered.length} issue${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
      )}

      {/* Issue cards */}
      <div className="max-w-3xl mx-auto px-4 pb-24 space-y-10">
        {filtered.map((issue) => {
          const sev = SEVERITY_STYLE[issue.severity] ?? SEVERITY_STYLE.common;
          return (
            <section key={issue.id} id={issue.id} className="scroll-mt-20">
              <div className="flex items-start gap-4 mb-5">
                <span className="text-3xl flex-shrink-0 mt-0.5">{issue.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${sev.bg} ${sev.border} ${sev.text}`}>
                      {sev.label}
                    </span>
                    {issue.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                          activeTag === tag
                            ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                            : 'bg-white/[0.04] border-white/[0.08] text-white/30 hover:text-white/50'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <h2 className="text-lg font-bold text-white/90 leading-snug">{issue.title}</h2>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-5 mb-3">
                <p className="text-white/55 text-sm leading-relaxed">{issue.whatHappened}</p>
              </div>

              <div className="rounded-xl border border-orange-500/15 bg-orange-500/5 p-5 mb-3">
                <div className="text-orange-400 text-xs font-semibold uppercase tracking-wide mb-3">Why this happens</div>
                <ul className="space-y-2">
                  {issue.whyItHappens.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/50 text-sm">
                      <span className="text-orange-400/50 flex-shrink-0 mt-0.5">→</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-white/40 text-xs font-semibold uppercase tracking-wide px-1">Solution</div>
                {issue.solution.map((s, i) => (
                  <div key={i} className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-emerald-500/10">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-emerald-400 text-sm font-medium">{s.step}</span>
                    </div>
                    <pre className="px-5 py-4 text-xs text-white/60 font-mono leading-relaxed overflow-x-auto bg-black/20 whitespace-pre-wrap break-words">
                      {s.code}
                    </pre>
                    {s.note && (
                      <div className="px-5 py-3 border-t border-emerald-500/10">
                        <p className="text-white/35 text-xs leading-relaxed">
                          <span className="text-emerald-400/60 font-medium">Note: </span>
                          {s.note}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-5 py-4 flex gap-3">
                <span className="text-blue-400 flex-shrink-0 text-base">💡</span>
                <div>
                  <span className="text-blue-400 text-xs font-semibold">Prevention: </span>
                  <span className="text-white/45 text-xs leading-relaxed">{issue.preventionTip}</span>
                </div>
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/25">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium text-white/35 mb-1">No issues found</p>
            <p className="text-sm">Try a different search term or clear the tag filter</p>
            <button onClick={() => { setSearch(''); setActiveTag(''); }} className="mt-4 text-purple-400/60 text-sm hover:text-purple-400 transition-colors">
              Clear filters
            </button>
          </div>
        )}

        {/* Contribute CTA */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
          <div className="text-2xl mb-3">🙋</div>
          <h2 className="text-lg font-bold text-white mb-2">Hit an issue not listed here?</h2>
          <p className="text-white/40 text-sm mb-6 leading-relaxed max-w-md mx-auto">
            Ask in the community channel so the answer helps the next person too.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/get-started"
              className="px-5 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-white/70 text-sm font-medium hover:bg-white/[0.1] transition-all"
            >
              📖 Read the Get Started guide
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
