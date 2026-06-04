'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { EventItem } from '@/lib/types';

function useCountdown(target: string) {
  const getRemaining = () => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return null;
    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor((diff % 86_400_000) / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    return { d, h, m, s, diff };
  };

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return remaining;
}

function CountdownDisplay({ target, urgent }: { target: string; urgent?: boolean }) {
  const r = useCountdown(target);

  if (!r) return (
    <span className="text-white/25 text-xs font-mono">Ended</span>
  );

  const pad = (n: number) => String(n).padStart(2, '0');

  if (r.d > 0) {
    return (
      <div className="flex items-baseline gap-1 font-mono">
        <span className={`text-2xl font-bold tabular-nums ${urgent ? 'text-red-400' : 'text-white/80'}`}>{r.d}</span>
        <span className="text-white/30 text-xs">d</span>
        <span className={`text-2xl font-bold tabular-nums ${urgent ? 'text-red-400' : 'text-white/80'}`}>{pad(r.h)}</span>
        <span className="text-white/30 text-xs">h</span>
        <span className={`text-xl font-bold tabular-nums ${urgent ? 'text-red-400' : 'text-white/60'}`}>{pad(r.m)}</span>
        <span className="text-white/30 text-xs">m</span>
      </div>
    );
  }

  return (
    <div className="flex items-baseline gap-1 font-mono">
      {r.h > 0 && (
        <>
          <span className={`text-2xl font-bold tabular-nums ${urgent ? 'text-red-400' : 'text-white/80'}`}>{r.h}</span>
          <span className="text-white/30 text-xs">h</span>
        </>
      )}
      <span className={`text-2xl font-bold tabular-nums ${urgent ? 'text-orange-400' : 'text-white/80'}`}>{pad(r.m)}</span>
      <span className="text-white/30 text-xs">m</span>
      <span className={`text-xl font-bold tabular-nums ${urgent ? 'text-orange-400' : 'text-white/50'}`}>{pad(r.s)}</span>
      <span className="text-white/30 text-xs">s</span>
    </div>
  );
}

const PROGRAM_COLORS: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  blue:   { text: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   dot: 'bg-blue-400'   },
  violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', dot: 'bg-violet-400' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  green:  { text: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  dot: 'bg-green-400'  },
  rose:   { text: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/30',   dot: 'bg-rose-400'   },
};

function SessionCard({ event }: { event: EventItem }) {
  const date = new Date(event.datetime);
  const r = useCountdown(event.datetime);
  const urgent = r !== null && r.diff < 3 * 3_600_000;

  return (
    <div className={`relative rounded-2xl border bg-white/[0.025] p-5 flex flex-col gap-4 transition-all ${
      urgent
        ? 'border-orange-500/25 shadow-lg shadow-orange-900/10'
        : 'border-white/[0.07] hover:border-purple-500/20 hover:bg-white/[0.04]'
    }`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Session
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Open to all
            </span>
          </div>
          <h3 className="font-semibold text-white/90 text-sm leading-snug">{event.title}</h3>
          {event.mentorName && (
            <p className="text-white/35 text-xs mt-0.5">
              with{' '}
              <Link href={`/mentors/${event.mentor}`} className="text-purple-400/80 hover:text-purple-300 transition-colors">
                {event.mentorName}
              </Link>
              {event.durationMins && <span className="text-white/25"> · {event.durationMins} min</span>}
            </p>
          )}
        </div>

        {/* Countdown clock */}
        <div className="text-right shrink-0">
          {r ? (
            <CountdownDisplay target={event.datetime} urgent={urgent} />
          ) : (
            <span className="text-white/25 text-xs">Ended</span>
          )}
          <p className="text-white/25 text-[10px] mt-0.5 tabular-nums">
            {date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}{' '}
            {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <p className="text-white/40 text-xs leading-relaxed">{event.description}</p>

      {/* CTA */}
      {event.bookingUrl && r && (
        <a
          href={event.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all self-start font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Join session
        </a>
      )}
    </div>
  );
}

function DeadlineCard({ event }: { event: EventItem }) {
  const c = PROGRAM_COLORS[event.programColor ?? 'blue'] ?? PROGRAM_COLORS.blue;
  const date = new Date(event.datetime);
  const r = useCountdown(event.datetime);
  const urgent = r !== null && r.diff < 24 * 3_600_000;
  const isMilestone = event.type === 'milestone';

  const inner = (
    <div className={`relative rounded-2xl border p-5 flex flex-col gap-4 transition-all ${
      event.url ? 'cursor-pointer' : ''
    } ${
      urgent && !isMilestone
        ? 'border-red-500/30 bg-red-500/5 hover:border-red-500/50'
        : isMilestone
          ? `border-dashed ${c.border} ${c.bg} hover:opacity-90`
          : `${c.border} ${c.bg} hover:opacity-90`
    }`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${c.bg} ${c.border} ${c.text}`}>
              {isMilestone
                ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                : <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
              }
              {event.program} {isMilestone ? 'Milestone' : 'Deadline'}
            </span>
            {urgent && !isMilestone && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 animate-pulse">
                Closing soon
              </span>
            )}
          </div>
          <h3 className="font-semibold text-white/90 text-sm leading-snug">{event.title}</h3>
          <p className="text-white/35 text-xs mt-0.5">
            {date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}{' '}
            · {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
          </p>
        </div>

        {/* Countdown */}
        <div className="text-right shrink-0">
          {r ? (
            <CountdownDisplay target={event.datetime} urgent={urgent && !isMilestone} />
          ) : (
            <span className="text-white/25 text-xs">{isMilestone ? 'Passed' : 'Closed'}</span>
          )}
          <p className="text-white/25 text-[10px] mt-0.5">{isMilestone ? 'to go' : 'remaining'}</p>
        </div>
      </div>

      <p className="text-white/40 text-xs leading-relaxed">{event.description}</p>

      {event.url && (
        <div className={`inline-flex items-center gap-1.5 text-xs ${c.text} self-start font-medium`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {isMilestone ? 'View details' : 'Apply now'}
        </div>
      )}
    </div>
  );

  return event.url ? (
    <a href={event.url} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : <div>{inner}</div>;
}

export function UpcomingEvents({ events }: { events: EventItem[] }) {
  const now = Date.now();
  const upcoming = events
    .filter((e) => new Date(e.datetime).getTime() > now - 60_000)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  if (upcoming.length === 0) return null;

  const sessions = upcoming.filter((e) => e.type === 'session');
  const deadlines = upcoming.filter((e) => e.type === 'deadline' || e.type === 'milestone');

  return (
    <section className="w-full max-w-5xl mx-auto px-4 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        <h2 className="text-white/70 text-sm font-semibold uppercase tracking-widest">
          Upcoming
        </h2>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sessions column */}
        {sessions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-white/40 text-xs font-medium">Mentor sessions</span>
            </div>
            <div className="space-y-3">
              {sessions.map((e) => <SessionCard key={e.id} event={e} />)}
            </div>
          </div>
        )}

        {/* Deadlines column */}
        {deadlines.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white/40 text-xs font-medium">Deadlines &amp; milestones</span>
            </div>
            <div className="space-y-3">
              {deadlines.map((e) => <DeadlineCard key={e.id} event={e} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
