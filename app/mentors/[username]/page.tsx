import { getEntry, getProgramMeta } from '@/lib/data';
import { getStudentProfile } from '@/lib/github';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return { title: `${username} — Mentors` };
}

export default async function MentorPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const entry = getEntry('mentors.json', username);
  if (!entry) notFound();

  const profile = await getStudentProfile(username);
  if (!profile) notFound();

  const hasBooking = Boolean(entry.bookingUrl);

  return (
    <main className="min-h-screen bg-[#0d0d14]">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Link href="/mentors" className="inline-flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          All mentors
        </Link>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden pt-8 pb-8 px-4">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-600/8 blur-[80px] rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Image
              src={profile.avatar_url}
              alt={profile.login}
              width={112}
              height={112}
              className="w-28 h-28 rounded-full ring-4 ring-blue-500/25 shadow-2xl object-cover flex-shrink-0"
            />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-white">{profile.name ?? profile.login}</h1>
              <p className="text-white/40 text-sm mt-0.5">@{profile.login}</p>
              <p className="text-white/55 mt-3 max-w-lg leading-relaxed">
                {entry.headline ?? profile.bio}
              </p>

              <div className="flex flex-wrap gap-3 mt-5 justify-center sm:justify-start">
                {/* Book a session CTA */}
                {hasBooking ? (
                  <a
                    href={entry.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm font-semibold hover:bg-blue-500/30 hover:border-blue-500/60 transition-all shadow-lg shadow-blue-900/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book a session
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07] text-white/25 text-sm cursor-default">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Booking not set up yet
                  </span>
                )}

                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.09] text-white/50 text-sm hover:text-white/80 hover:bg-white/[0.08] transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  GitHub
                </a>

                {profile.location && (
                  <span className="inline-flex items-center gap-1.5 text-white/30 text-sm">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0a5 5 0 0 0-5 5c0 2.76 2.5 4.9 5 8 2.5-3.1 5-5.24 5-8a5 5 0 0 0-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                    </svg>
                    {profile.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-24 space-y-10">

        {/* Booking card — shown when bookingUrl is set */}
        {hasBooking && (
          <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-blue-400 text-xs font-semibold uppercase tracking-wide">
                    Available for sessions
                  </span>
                </div>
                <h3 className="text-white/85 font-semibold text-base">
                  Book a 1-on-1 with {profile.name ?? profile.login}
                </h3>
                <p className="text-white/40 text-sm mt-1 leading-relaxed">
                  Pick a time that works for you directly from their Google Calendar.
                  Sessions are free — come prepared with specific questions.
                </p>
              </div>
              <a
                href={entry.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500/25 border border-blue-500/50 text-blue-200 font-semibold text-sm hover:bg-blue-500/35 hover:border-blue-400/60 transition-all whitespace-nowrap shadow-lg shadow-blue-900/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Open booking calendar
                <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Tips row */}
            <div className="mt-5 pt-5 border-t border-blue-500/15 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-white/35">
              {[
                { icon: '✅', text: 'Come with a specific question or PR to review' },
                { icon: '✅', text: 'Share your GitHub profile in advance' },
                { icon: '❌', text: "Don't ask for solutions — ask for direction" },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span>{tip.icon}</span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Programs */}
        {entry.programs.length > 0 && (
          <section>
            <h2 className="text-white/50 text-xs font-medium uppercase tracking-widest mb-4">
              Open Source Programs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {entry.programs.map((prog, i) => {
                const meta = getProgramMeta(prog.name);
                const card = (
                  <div className={`rounded-2xl border p-5 ${meta.bg} ${meta.border} ${prog.url ? 'hover:opacity-90 transition-opacity cursor-pointer' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className={`text-base font-semibold ${meta.color}`}>{prog.name}</div>
                        <div className="text-white/50 text-sm mt-0.5">{meta.label}</div>
                        {prog.org && <div className="text-white/35 text-xs mt-1">{prog.org}</div>}
                        {prog.mentors && prog.mentors.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {prog.mentors.map((m, mi) => (
                              <span key={mi} className="text-white/40 text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {prog.year && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.color} border ${meta.border}`}>
                          {prog.year}
                        </span>
                      )}
                    </div>
                    {prog.url && (
                      <div className={`mt-4 flex items-center gap-1.5 text-xs ${meta.color}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View report
                      </div>
                    )}
                  </div>
                );
                return prog.url ? (
                  <a key={i} href={prog.url} target="_blank" rel="noopener noreferrer">{card}</a>
                ) : (
                  <div key={i}>{card}</div>
                );
              })}
            </div>
          </section>
        )}

        {/* Setup instructions for mentor (shown when no booking URL) */}
        {!hasBooking && (
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <h3 className="text-white/50 text-xs font-medium uppercase tracking-widest mb-4">
              For the mentor — set up your booking link
            </h3>
            <div className="space-y-3">
              {[
                'Open Google Calendar and click the grid icon (top right) → go to Appointment schedules.',
                'Click "Create new appointment schedule" and set your available time slots.',
                'Under "Booking page", copy the public booking page URL.',
                `Paste it into data/mentors.json as "bookingUrl" for your entry (@${username}).`,
                'Deploy / restart the site — your "Book a session" button will appear.',
              ].map((step, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-white/20 tabular-nums flex-shrink-0 mt-0.5">{i + 1}.</span>
                  <span className="text-white/45 leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
            <p className="text-white/25 text-xs mt-4">
              Google Calendar appointment scheduling is free with any Google account.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
