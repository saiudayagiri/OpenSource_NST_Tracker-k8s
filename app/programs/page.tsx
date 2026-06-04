import Link from 'next/link';

export const metadata = { title: 'Open Source Programs — Opensource Tracker NST' };

const PROGRAMS = [
  {
    id: 'gsoc',
    name: 'Google Summer of Code',
    short: 'GSoC',
    color: 'text-blue-400',
    accent: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    dot: 'bg-blue-400',
    dotBorder: 'border-blue-500/40',
    stipend: '$3,000 – $6,600+',
    duration: '12 weeks (June – August)',
    eligibility: 'Students 18+ worldwide. No degree required.',
    deadline: 'Applications typically open in March',
    org: 'Google',
    link: 'https://summerofcode.withgoogle.com',
    desc: 'The most prestigious open source internship program in the world, run by Google since 2005. Students work with a mentoring open source organization on a 12-week coding project and receive a stipend. Thousands of organizations participate each year — including Python, Linux Kernel, Mozilla, NumPy, KDE, and hundreds more.',
    tips: [
      'Start contributing to your target org 3–6 months before applications open',
      'Write a strong proposal — the project plan is the single most important factor',
      'Get at least 2–3 PRs merged in the org before submitting',
      'Talk to potential mentors on the org\'s communication channels',
      'Read accepted proposals from previous years (many orgs publish them)',
    ],
    nst: 'NST students have been selected into GSoC at Python Software Foundation, Google DeepMind, SymPy, Oppia, VideoLAN, KDE Community, JSON Schema, and University of Alaska Anchorage.',
  },
  {
    id: 'lfx',
    name: 'LFX Mentorship',
    short: 'LFX',
    color: 'text-violet-400',
    accent: 'border-violet-500/30',
    bg: 'bg-violet-500/5',
    dot: 'bg-violet-400',
    dotBorder: 'border-violet-500/40',
    stipend: '$3,000 – $6,600',
    duration: '12 weeks, runs 3 terms per year',
    eligibility: 'Students and new contributors globally',
    deadline: 'Applications open 3 times a year (Spring, Summer, Fall)',
    org: 'Linux Foundation',
    link: 'https://mentorship.lfx.linuxfoundation.org',
    desc: 'The Linux Foundation\'s mentorship program connecting new contributors with experienced open source mentors across CNCF, Kubernetes, Prometheus, Envoy, Hyperledger, and dozens of other major cloud-native and enterprise projects. Great for those interested in infrastructure, DevOps, and cloud-native technologies.',
    tips: [
      'Browse projects on the LFX portal and filter by technology or interest',
      'Make early contributions to shortlisted projects — competition is high',
      'Write a detailed application explaining your background and plan',
      'CNCF and Kubernetes projects are very popular — start early',
      'Each term has different projects, so check back each cycle',
    ],
    nst: 'NST students have contributed to Kubernetes, eBPF tooling, and CNCF projects through LFX.',
  },
  {
    id: 'outreachy',
    name: 'Outreachy',
    short: 'Outreachy',
    color: 'text-green-400',
    accent: 'border-green-500/30',
    bg: 'bg-green-500/5',
    dot: 'bg-green-400',
    dotBorder: 'border-green-500/40',
    stipend: '$7,000',
    duration: '3 months',
    eligibility: 'People underrepresented in tech. Specific eligibility criteria applies — check the site.',
    deadline: 'Applications typically open in January and August',
    org: 'Software Freedom Conservancy',
    link: 'https://www.outreachy.org',
    desc: 'Outreachy provides paid internships in open source and open science to people subject to systemic bias and underrepresentation in tech. It has one of the highest stipends of any open source program ($7,000). Organizations include Wikimedia, GNOME, Linux Kernel, Mozilla, Python, and many more.',
    tips: [
      'Check eligibility criteria carefully before applying — it is specific',
      'The contribution period (before final application) is critical — contribute actively',
      'Communicate regularly with mentors during the contribution phase',
      'Your final application quality directly reflects your contributions',
      'Reach out to past Outreachy interns for guidance',
    ],
    nst: 'NST students have interned at Wikimedia Foundation and GNOME through Outreachy.',
  },
  {
    id: 'summer-of-bitcoin',
    name: 'Summer of Bitcoin',
    short: 'SoB',
    color: 'text-orange-400',
    accent: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
    dot: 'bg-orange-400',
    dotBorder: 'border-orange-500/40',
    stipend: '$3,000 + 0.1 BTC',
    duration: '12 weeks (June – August)',
    eligibility: 'University students globally with interest in Bitcoin',
    deadline: 'Applications open in February–March',
    org: 'Summer of Bitcoin Foundation',
    link: 'https://www.summerofbitcoin.org',
    desc: 'A global, online summer internship program focused on introducing university students to Bitcoin open source development and Bitcoin design. Students work with Bitcoin and Lightning Network projects and receive both a cash stipend and Bitcoin. This is one of the few programs specifically focused on the Bitcoin/Lightning ecosystem.',
    tips: [
      'Learn Bitcoin fundamentals and Lightning Network basics before applying',
      'Contribute to Bitcoin FOSS projects on GitHub ahead of the application period',
      'Having prior knowledge of cryptography or distributed systems helps',
      'Projects include Bitcoin Core, Lightning, Rust Bitcoin, and related tooling',
      'The program is highly selective — quality of contributions matters a lot',
    ],
    nst: 'NST students have worked on Lightning Network payment tooling and Bitcoin Script testing infrastructure.',
  },
  {
    id: 'mlh',
    name: 'MLH Fellowship',
    short: 'MLH',
    color: 'text-rose-400',
    accent: 'border-rose-500/30',
    bg: 'bg-rose-500/5',
    dot: 'bg-rose-400',
    dotBorder: 'border-rose-500/40',
    stipend: '$5,000 (stipend varies by track)',
    duration: '12 weeks',
    eligibility: 'Students and recent graduates globally',
    deadline: 'Rolling applications — check MLH site for current batch',
    org: 'Major League Hacking',
    link: 'https://fellowship.mlh.io',
    desc: 'The MLH Fellowship is a 12-week internship alternative for software engineers. Fellows contribute to open source projects used by companies like Meta, GitHub, and others, or build their own open source projects. There are multiple tracks: Open Source, Explorer, and Production Engineering (with Meta). Fellows receive mentorship and a stipend.',
    tips: [
      'Apply early — spots fill up quickly',
      'The Explorer track is good for beginners with no prior OS experience',
      'The Open Source track requires demonstrated contribution ability',
      'Prepare a strong GitHub profile with real projects',
      'MLH also runs hackathons — participating helps you get noticed',
    ],
    nst: 'NST students have contributed to open source ML infrastructure through MLH Fellowship.',
  },
  {
    id: 'hacktoberfest',
    name: 'Hacktoberfest',
    short: 'Hacktoberfest',
    color: 'text-pink-400',
    accent: 'border-pink-500/30',
    bg: 'bg-pink-500/5',
    dot: 'bg-pink-400',
    dotBorder: 'border-pink-500/40',
    stipend: 'Digital rewards (no cash stipend)',
    duration: 'October (1 month)',
    eligibility: 'Anyone globally',
    deadline: 'Runs every October — register at any time during the month',
    org: 'DigitalOcean + GitHub',
    link: 'https://hacktoberfest.com',
    desc: 'Hacktoberfest is a month-long celebration of open source held every October. Participants who complete 4 pull requests to participating GitHub repos earn a digital reward (previously a t-shirt, now a digital badge). It\'s the best on-ramp for first-time contributors — thousands of repos specifically tag "Hacktoberfest" issues for newcomers.',
    tips: [
      'Perfect for making your first open source contribution',
      'Look for repos tagged with "hacktoberfest" on GitHub',
      'Quality over quantity — spammy PRs will be marked as invalid',
      'Use it as practice for larger programs like GSoC',
      'Many orgs run workshops and events during October — attend them',
    ],
    nst: 'A great starting point for NST students to build their first contribution track record before applying to bigger programs.',
  },
];

export default function ProgramsPage() {
  return (
    <main className="min-h-screen bg-[#0d0d14]">
      {/* Hero */}
      <div className="relative overflow-hidden pt-14 pb-10 px-4">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-[500px] h-[350px] rounded-full bg-blue-600/7 blur-[100px]" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[300px] rounded-full bg-violet-600/7 blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-blue-300/70 mb-6">
            Paid internships · Global programs · Real-world impact
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Open Source{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400">
              Programs
            </span>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            A guide to the world&apos;s best paid open source programs — stipends, timelines,
            eligibility, and how NST students have fared.
          </p>

          {/* Quick jump */}
          <div className="flex flex-wrap gap-2 justify-center">
            {PROGRAMS.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${p.bg} ${p.accent} ${p.color} hover:opacity-80`}
              >
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${p.dot} mr-1.5 align-middle`} />
                {p.short}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-24 space-y-12">

        {/* Quick comparison cards */}
        <section>
          <h2 className="text-white/50 text-xs font-medium uppercase tracking-widest mb-4">
            Quick Comparison
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PROGRAMS.map((p) => (
              <div key={p.id} className={`rounded-xl border ${p.accent} ${p.bg} p-4`}>
                <div className={`font-bold text-sm mb-2 ${p.color}`}>{p.short}</div>
                <div className="space-y-1 text-xs text-white/50">
                  <div className="flex justify-between"><span className="text-white/30">Stipend</span><span>{p.stipend}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Duration</span><span>{p.duration.split('(')[0].trim()}</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Deadline</span><span>{p.deadline.split('—')[0].trim()}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Program detail sections */}
        {PROGRAMS.map((p) => (
          <section key={p.id} id={p.id}>
            <div className={`rounded-2xl border ${p.accent} ${p.bg} overflow-hidden`}>
              {/* Header */}
              <div className="p-6 border-b border-white/[0.05]">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                      <span className={`text-xs font-medium ${p.color} opacity-70`}>{p.org}</span>
                    </div>
                    <h2 className={`text-2xl font-bold ${p.color}`}>{p.name}</h2>
                  </div>
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${p.accent} ${p.color} hover:opacity-80 transition-opacity`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Official site
                  </a>
                </div>

                <p className="text-white/55 text-sm mt-4 leading-relaxed">{p.desc}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.04]">
                {[
                  { label: 'Stipend', value: p.stipend },
                  { label: 'Duration', value: p.duration },
                  { label: 'Eligibility', value: p.eligibility },
                  { label: 'Apply By', value: p.deadline },
                ].map((item) => (
                  <div key={item.label} className={`${p.bg} px-4 py-3`}>
                    <div className="text-white/30 text-xs mb-1">{item.label}</div>
                    <div className="text-white/70 text-xs font-medium leading-snug">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="p-6 border-t border-white/[0.05]">
                <div className={`text-xs font-semibold ${p.color} uppercase tracking-wide mb-3`}>
                  Tips to get selected
                </div>
                <ul className="space-y-2">
                  {p.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/50 text-sm">
                      <span className={`${p.color} opacity-50 flex-shrink-0 mt-0.5`}>✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* NST track record */}
              <div className={`px-6 py-4 border-t border-white/[0.05] bg-white/[0.02]`}>
                <span className={`text-xs font-semibold ${p.color}`}>NST track record — </span>
                <span className="text-white/40 text-xs">{p.nst}</span>
              </div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Ready to start your journey?</h2>
          <p className="text-white/40 text-sm mb-6">
            See who is contributing, find a mentor, and learn how to get started.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/contributors"
              className="px-5 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-white/80 text-sm font-medium hover:bg-white/[0.1] transition-all"
            >
              View Contributors
            </Link>
            <Link
              href="/mentors"
              className="px-5 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-sm font-medium hover:bg-blue-500/20 transition-all"
            >
              Find a Mentor
            </Link>
            <Link
              href="/achievers"
              className="px-5 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-300 text-sm font-medium hover:bg-yellow-500/15 transition-all"
            >
              Hall of Fame
            </Link>
            <Link
              href="/get-started"
              className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm font-medium hover:bg-emerald-500/15 transition-all"
            >
              Get Started Guide
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
