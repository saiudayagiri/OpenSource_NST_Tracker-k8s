import { getMentors, getProgramMeta, type PersonEntry } from '@/lib/data';
import { getStudentProfile, type GitHubUser } from '@/lib/github';
import Image from 'next/image';
import Link from 'next/link';

const AVATAR_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-purple-500',
  'from-orange-500 to-amber-500',
  'from-green-500 to-emerald-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-blue-500',
];

function InitialsAvatar({ name, size = 56 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div
      className={`bg-gradient-to-br ${color} rounded-full flex items-center justify-center ring-2 ring-white/10 flex-shrink-0 font-bold text-white`}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {initials}
    </div>
  );
}

function MentorCard({ entry, profile }: { entry: PersonEntry; profile: GitHubUser | null }) {
  const displayName = profile?.name ?? entry.name ?? entry.github;
  return (
    <Link
      href={`/mentors/${entry.github}`}
      className="group bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-900/15 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4 mb-4">
        {profile ? (
          <Image
            src={profile.avatar_url}
            alt={displayName}
            width={56}
            height={56}
            className="w-14 h-14 rounded-full ring-2 ring-white/10 group-hover:ring-blue-500/40 transition-all object-cover flex-shrink-0"
          />
        ) : (
          <InitialsAvatar name={displayName} />
        )}
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="font-semibold text-white/90 group-hover:text-white truncate transition-colors">
            {displayName}
          </h3>
          <p className="text-white/35 text-xs mt-0.5">@{entry.github}</p>
          {(entry.headline ?? profile?.bio) && (
            <p className="text-white/40 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {entry.headline ?? profile?.bio}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {entry.programs.map((prog, i) => {
          const meta = getProgramMeta(prog.name);
          return (
            <span
              key={i}
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {prog.name}
              {prog.year && <span className="opacity-60">{prog.year}</span>}
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-white/20 text-xs group-hover:text-white/40 transition-colors">
          View profile →
        </span>
        {entry.bookingUrl && (
          <a
            href={entry.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-medium hover:bg-blue-500/25 hover:border-blue-500/50 transition-all"
          >
            <CalendarIcon />
            Book a session
          </a>
        )}
      </div>
    </Link>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export const revalidate = 3600;
export const metadata = { title: 'Mentors — Opensource Tracker NST' };

export default async function MentorsPage() {
  const entries = getMentors();

  const mentors = await Promise.all(
    entries.map(async (e) => ({
      entry: e,
      profile: await getStudentProfile(e.github),
    }))
  );

  return (
    <main className="min-h-screen bg-[#0d0d14]">
      <div className="relative overflow-hidden pt-14 pb-10 px-4">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 left-1/3 w-[500px] h-[350px] rounded-full bg-blue-600/8 blur-[100px]" />
          <div className="absolute top-0 right-1/3 w-[400px] h-[300px] rounded-full bg-purple-600/8 blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-blue-300/70 mb-6">
            Guiding the next generation of open source contributors
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
              Mentors
            </span>
          </h1>
          <p className="text-white/40 text-lg max-w-lg mx-auto">
            Experienced contributors who guide students through open source.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-24">
        {mentors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 mb-4">No mentors added yet.</p>
            <pre className="bg-white/5 border border-white/10 rounded-xl p-4 text-left text-xs text-white/50 font-mono max-w-md mx-auto">
{`// data/mentors.json
[
  {
    "github": "username",
    "headline": "Short bio",
    "programs": [
      { "name": "GSoC", "year": 2023,
        "org": "Org Name", "url": "" }
    ]
  }
]`}
            </pre>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mentors.map(({ entry, profile }) => (
              <MentorCard key={entry.github} entry={entry} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
