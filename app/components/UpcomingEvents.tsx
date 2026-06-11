'use client';

import { useEffect, useState } from 'react';
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
  const [now] = useState(() => Date.now());

  const upcoming = events
    .filter((e) => new Date(e.datetime).getTime() > now - 60_000)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  if (upcoming.length === 0) return null;

  const deadlines = upcoming.filter((e) => e.type === 'deadline' || e.type === 'milestone');

  if (deadlines.length === 0) return null;

  return (
    <section className="w-full max-w-2xl mx-auto px-4 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
        <h2 className="text-white/70 text-sm font-semibold uppercase tracking-widest">
          Upcoming Deadlines &amp; Milestones
        </h2>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      <div className="space-y-3">
        {deadlines.map((e) => <DeadlineCard key={e.id} event={e} />)}
      </div>
    </section>
  );
}
