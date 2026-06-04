import { getAllStudentSummaries, getStudents, buildDateQuery } from '@/lib/github';
import { FilterBar } from './FilterBar';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';

export const revalidate = 3600;

export const metadata = {
  title: 'Contributors — Opensource Tracker',
  description: 'Student open source contributions',
};

function PRBar({ merged, open, closed, total }: { merged: number; open: number; closed: number; total: number }) {
  if (total === 0) return <div className="w-full h-1.5 rounded-full bg-white/10" />;
  return (
    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden flex">
      <div className="h-full bg-emerald-500" style={{ width: `${(merged / total) * 100}%` }} />
      <div className="h-full bg-teal-400" style={{ width: `${(open / total) * 100}%` }} />
      <div className="h-full bg-red-500/60" style={{ width: `${(closed / total) * 100}%` }} />
    </div>
  );
}

const rankStyles = [
  'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  'bg-slate-400/20 text-slate-300 border-slate-400/40',
  'bg-orange-600/20 text-orange-400 border-orange-600/40',
];

export default async function ContributorsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string; search?: string }>;
}) {
  const { period = 'all', from, to, search = '' } = await searchParams;
  const dateQuery = buildDateQuery(period, from, to);
  const students = getStudents();

  if (students.length === 0) {
    return (
      <main className="min-h-screen bg-[#0d0d14] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">👥</div>
          <h1 className="text-2xl font-bold text-white mb-3">No students added yet</h1>
          <p className="text-white/50 mb-6">
            Add GitHub usernames to{' '}
            <code className="bg-white/10 px-1.5 py-0.5 rounded text-purple-300">data/students.json</code>
          </p>
          <pre className="bg-white/5 border border-white/10 rounded-xl p-4 text-left text-sm text-white/80 font-mono">
            {`[\n  "github-username-1",\n  "github-username-2"\n]`}
          </pre>
        </div>
      </main>
    );
  }

  const allSummaries = await getAllStudentSummaries(dateQuery);
  const summaries = search
    ? allSummaries.filter((s) => {
        const q = search.toLowerCase();
        return (
          s.profile.login.toLowerCase().includes(q) ||
          (s.profile.name ?? '').toLowerCase().includes(q)
        );
      })
    : allSummaries;
  const totalPRs = allSummaries.reduce((s, c) => s + c.totalPRs, 0);
  const totalMerged = allSummaries.reduce((s, c) => s + c.mergedPRs, 0);

  return (
    <main className="min-h-screen bg-[#0d0d14]">
      {/* Hero */}
      <div className="relative overflow-hidden pt-16 pb-12 px-4">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[300px] rounded-full bg-blue-600/8 blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-sm mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Opensource Tracker{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400">
              NST
            </span>
          </h1>
          <p className="text-white/40 text-lg max-w-lg mx-auto mb-3">
            Track all opensource contributions and celebrate our contributors
          </p>
          <p className="text-white/25 text-sm max-w-lg mx-auto mb-12">
            Let&apos;s celebrate our Open Source contributors!
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Students', value: summaries.length },
              { label: 'Total PRs', value: totalPRs },
              { label: 'Merged PRs', value: totalMerged },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-8 py-4 backdrop-blur-sm"
              >
                <div className="text-3xl font-bold text-white tabular-nums">{stat.value}</div>
                <div className="text-white/35 text-sm mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <Suspense>
        <FilterBar />
      </Suspense>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaries.map((summary, index) => (
            <Link
              key={summary.profile.login}
              href={`/contributors/${summary.profile.login}?rank=${index + 1}`}
              className="group relative bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-purple-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-purple-900/20 hover:-translate-y-0.5"
            >
              {index < 3 && (
                <div
                  className={`absolute top-4 right-4 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${rankStyles[index]}`}
                >
                  #{index + 1}
                </div>
              )}

              <div className="flex items-start gap-4 mb-5">
                {/* Avatar with optional mentor overlay */}
                <div className="relative flex-shrink-0">
                  <Image
                    src={summary.profile.avatar_url}
                    alt={summary.profile.login}
                    width={52}
                    height={52}
                    className="w-[52px] h-[52px] rounded-full ring-2 ring-white/10 group-hover:ring-purple-500/40 transition-all object-cover"
                  />
                  {summary.mentor && (
                    <div
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full ring-2 ring-[#0d0d14] overflow-hidden"
                      title={`Mentored by @${summary.mentor}`}
                    >
                      <Image
                        src={`https://avatars.githubusercontent.com/${summary.mentor}`}
                        alt={`Mentor: ${summary.mentor}`}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="font-semibold text-white/90 group-hover:text-white truncate transition-colors">
                    {summary.profile.name ?? summary.profile.login}
                  </h3>
                  <p className="text-white/35 text-xs mt-0.5 truncate">@{summary.profile.login}</p>
                  {summary.mentor && (
                    <p className="text-white/25 text-xs mt-0.5 truncate">
                      mentored by{' '}
                      <span className="text-purple-400/70">@{summary.mentor}</span>
                    </p>
                  )}
                  <p className="text-white/40 text-sm mt-1">
                    {summary.totalPRs} contribution{summary.totalPRs !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  {summary.mergedPRs} merged
                </span>
                {summary.openPRs > 0 && (
                  <span className="flex items-center gap-1.5 text-teal-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                    {summary.openPRs} open
                  </span>
                )}
                {summary.closedPRs > 0 && (
                  <span className="flex items-center gap-1.5 text-red-400/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 flex-shrink-0" />
                    {summary.closedPRs} closed
                  </span>
                )}
              </div>

              <PRBar
                merged={summary.mergedPRs}
                open={summary.openPRs}
                closed={summary.closedPRs}
                total={summary.totalPRs}
              />

              <div className="mt-4 flex items-center justify-between">
                <span className="text-white/20 text-xs group-hover:text-white/40 transition-colors">
                  View all contributions
                </span>
                <svg
                  className="w-4 h-4 text-white/15 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
