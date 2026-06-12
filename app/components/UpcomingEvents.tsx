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

const TYPE_COLORS: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  session:      { text: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   dot: 'bg-blue-400'   },
  deadline:     { text: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    dot: 'bg-red-400'    },
  announcement: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
};

function DeadlineCard({ event }: { event: EventItem }) {
  const c = TYPE_COLORS[event.type] ?? TYPE_COLORS.session;
  const date = new Date(event.date);
  const r = useCountdown(event.date);
  const urgent = r !== null && r.diff < 24 * 3_600_000;

  const inner = (
    <div className={`relative rounded-2xl border p-5 flex flex-col gap-4 transition-all ${
      event.link ? 'cursor-pointer hover:border-white/20' : ''
    } ${c.border} ${c.bg}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${c.bg} ${c.border} ${c.text} capitalize`}>
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
              {event.type}
            </span>
            {urgent && event.type === 'deadline' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 animate-pulse">
                Closing soon
              </span>
            )}
          </div>
          <h3 className="font-semibold text-white/90 text-sm leading-snug">{event.title}</h3>
          <p className="text-white/35 text-xs mt-0.5">
            {date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Countdown */}
        <div className="text-right shrink-0">
          {r ? (
            <CountdownDisplay target={event.date} urgent={urgent && event.type === 'deadline'} />
          ) : (
            <span className="text-white/25 text-xs">Passed</span>
          )}
        </div>
      </div>

      <p className="text-white/40 text-xs leading-relaxed">{event.description}</p>

      {event.link && (
        <div className={`inline-flex items-center gap-1.5 text-xs ${c.text} self-start font-medium`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Learn more
        </div>
      )}
    </div>
  );

  return event.link ? (
    <a href={event.link} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : <div>{inner}</div>;
}

export function UpcomingEvents({ events }: { events: EventItem[] }) {
  const [now] = useState(() => Date.now());

  const upcoming = events
    .filter((e) => new Date(e.date).getTime() > now - 86_400_000)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (upcoming.length === 0) return null;

  return (
    <section className="w-full max-w-2xl mx-auto px-4 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
        <h2 className="text-white/70 text-sm font-semibold uppercase tracking-widest">
          Upcoming Events &amp; Deadlines
        </h2>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      <div className="space-y-3">
        {upcoming.map((e) => <DeadlineCard key={e.id} event={e} />)}
      </div>
    </section>
  );
}
