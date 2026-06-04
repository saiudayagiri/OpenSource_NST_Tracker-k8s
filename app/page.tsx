import Link from 'next/link';
import { getEvents } from '@/lib/data';
import { UpcomingEvents } from './components/UpcomingEvents';

export default function Home() {
  const events = getEvents();

  return (
    <main className="min-h-screen bg-[#0d0d14]">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-600/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full" />
      </div>

      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center text-center px-4 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-purple-300/70 mb-8">
          Open Source
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          Opensource Tracker{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            NST
          </span>
        </h1>

        <p className="text-white/40 text-lg mb-2 max-w-lg">
          Track all opensource contributions and celebrate our contributors
        </p>
        <p className="text-white/25 text-sm mb-10">
          Let&apos;s celebrate our Open Source contributors!
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/contributors"
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-8 py-3.5 rounded-full transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View Contributors
          </Link>
          <Link
            href="/mentors"
            className="inline-flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] text-white/70 hover:text-white font-semibold px-7 py-3.5 rounded-full transition-all"
          >
            Find a Mentor
          </Link>
        </div>
      </div>

      {/* Quick nav strip */}
      <div className="relative max-w-5xl mx-auto px-4 mb-16">
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { label: 'Contributors', href: '/contributors', icon: '👥' },
            { label: 'Mentors',      href: '/mentors',      icon: '🎓' },
            { label: 'Hall of Fame', href: '/achievers',    icon: '🏆' },
            { label: 'Programs',     href: '/programs',     icon: '🚀' },
            { label: 'Get Started',  href: '/get-started',  icon: '📖' },
            { label: 'Issues',       href: '/issues',       icon: '🔧' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.07] text-white/40 text-sm hover:text-white/70 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming sessions + deadlines */}
      <UpcomingEvents events={events} />
    </main>
  );
}
