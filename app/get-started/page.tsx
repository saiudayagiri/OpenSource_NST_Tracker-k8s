import Link from 'next/link';

export const metadata = { title: 'Get Started — Opensource Tracker NST' };

const sections = [
  {
    id: 'what-is-opensource',
    title: 'What is Open Source?',
    color: 'text-blue-400',
    accent: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    content: [
      'Open source software is code that is publicly available for anyone to view, modify, and distribute. Unlike proprietary software, the source code is shared openly — anyone can see exactly how it works.',
      'Popular examples include the Linux kernel (powers most of the internet), VS Code (the editor you may be using right now), Python, React, and thousands of libraries you use every day.',
      'Open source is not just software — it is a philosophy of transparency, collaboration, and shared ownership. When you contribute, your work benefits millions of people worldwide.',
    ],
  },
  {
    id: 'why-opensource',
    title: 'Why Contribute to Open Source?',
    color: 'text-purple-400',
    accent: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
    bullets: [
      { icon: '🚀', title: 'Real-world experience', desc: 'Work on production codebases used by millions — not toy projects.' },
      { icon: '🌐', title: 'Global visibility', desc: 'Your GitHub profile becomes your living portfolio. Recruiters at top companies actively look for open source contributors.' },
      { icon: '🤝', title: 'Community & networking', desc: 'Connect with engineers at Google, Meta, Mozilla, and leading research labs.' },
      { icon: '💰', title: 'Paid programs', desc: 'GSoC, LFX, Outreachy, and Summer of Bitcoin pay stipends of $3,000–$6,600+ for summer contributions.' },
      { icon: '🧠', title: 'Deep technical growth', desc: 'Reading and writing production-grade code accelerates learning faster than any course.' },
      { icon: '📜', title: 'Credibility', desc: 'Merged PRs in major projects are proof of skill that transcends grades and certificates.' },
    ],
  },
  {
    id: 'how-to-start',
    title: 'How to Get Started',
    color: 'text-emerald-400',
    accent: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    steps: [
      { n: '1', title: 'Set up your environment', desc: 'Git, GitHub account, SSH keys, and a good code editor. Learn basic git — clone, branch, commit, push, pull request.' },
      { n: '2', title: 'Pick a project you use', desc: 'Start with tools you already use. If you use Python, contribute to a Python library. Familiarity makes onboarding much easier.' },
      { n: '3', title: 'Read CONTRIBUTING.md first', desc: 'Every serious project has contribution guidelines. Read them before writing a single line. This alone separates good contributors from bad ones.' },
      { n: '4', title: 'Start with good first issues', desc: 'Filter GitHub issues by "good first issue" or "beginner friendly" labels. These are intentionally scoped for newcomers.' },
      { n: '5', title: 'Understand before you fix', desc: 'Read the surrounding code, understand the architecture, reproduce the bug locally. A targeted 10-line fix beats a sprawling refactor.' },
      { n: '6', title: 'Write a clear PR description', desc: 'Explain what you changed, why, and how to test it. Include before/after screenshots for UI changes. Reviewers are volunteers — make their job easy.' },
    ],
  },
  {
    id: 'essentials',
    title: 'Essentials to Learn First',
    color: 'text-orange-400',
    accent: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
    grid: [
      { title: 'Git & GitHub', items: ['Branching and merging', 'Rebasing vs merging', 'Resolving merge conflicts', 'Writing good commit messages', 'Forking and syncing upstream'] },
      { title: 'Reading Code', items: ['Navigating large codebases', 'Understanding test suites', 'Following data flow', 'Reading documentation inline', 'Using grep/search effectively'] },
      { title: 'Communication', items: ['Writing issue comments', 'Responding to review feedback', 'Asking precise questions', 'Discussing tradeoffs', 'Being patient and respectful'] },
      { title: 'Tooling', items: ['Running projects locally', 'Understanding build systems', 'Linters and formatters', 'CI/CD pipelines', 'Docker for dev environments'] },
    ],
  },
  {
    id: 'mentors',
    title: 'Who Are Our Mentors?',
    color: 'text-cyan-400',
    accent: 'border-cyan-500/30',
    bg: 'bg-cyan-500/5',
    content: [
      'Our mentors are students and alumni who have already cracked competitive open source programs — GSoC, LFX, Outreachy, Summer of Bitcoin, and more. They have walked the same path you are starting and know exactly what it takes.',
      'They are not teachers in the traditional sense. They are senior peers who can give you an honest assessment of your PRs, point you to the right issues, help you prepare proposals, and guide you through the unwritten rules of open source communities.',
    ],
    cta: { label: 'Meet Our Mentors', href: '/mentors' },
  },
  {
    id: 'contacting-mentors',
    title: 'Working With Mentors',
    color: 'text-violet-400',
    accent: 'border-violet-500/30',
    bg: 'bg-violet-500/5',
    bullets: [
      { icon: '✅', title: 'Come prepared', desc: 'Before reaching out, try the problem yourself. Share what you tried and where you got stuck.' },
      { icon: '✅', title: 'Be specific', desc: 'Don\'t ask "how do I contribute?" — ask "I\'m looking at issue #123 in project X, I think the fix is Y, does that make sense?"' },
      { icon: '✅', title: 'Respect their time', desc: 'Mentors are students too. A single well-formed question gets better answers than a stream of vague messages.' },
      { icon: '✅', title: 'Share your progress', desc: 'Mentors are invested in your success. A quick update when you get something merged goes a long way.' },
      { icon: '❌', title: 'Don\'t ask to be spoon-fed', desc: 'A mentor\'s job is to guide, not to do the work for you. Asking for solutions without effort is disrespectful.' },
      { icon: '❌', title: 'Don\'t disappear', desc: 'If you start working with a mentor on something, follow through. Going silent is a waste of everyone\'s time.' },
    ],
  },
];

const guidelines = [
  {
    icon: '🚫',
    title: 'No AI-generated PRs',
    severity: 'critical',
    desc: 'Submitting code generated by ChatGPT, Copilot, Claude, or any AI tool as your own work is a form of plagiarism. Open source maintainers can detect it. It wastes their review time. Many projects explicitly ban it. If you are caught, you will be blocked and your reputation in the community will be damaged — permanently.',
  },
  {
    icon: '🚫',
    title: 'No spam contributions',
    severity: 'critical',
    desc: 'Fixing typos in README files, changing whitespace, renaming variables for no reason, or adding blank lines just to inflate your PR count is spam. Maintainers have seen every trick. Spammy contributors get blocked and blacklisted from programs like GSoC and Outreachy.',
  },
  {
    icon: '🚫',
    title: 'No copy-paste from Stack Overflow / blogs',
    severity: 'high',
    desc: 'Copying solutions you do not understand and submitting them creates bugs that are hard to trace. If you cannot explain every line of your PR, it is not ready.',
  },
  {
    icon: '🚫',
    title: 'No "drive-by" PRs',
    severity: 'high',
    desc: 'Opening a PR, getting review feedback, then going silent is disrespectful. Either respond to feedback within a reasonable time or close the PR yourself.',
  },
  {
    icon: '🚫',
    title: 'No self-promotional noise',
    severity: 'medium',
    desc: 'Do not open issues just to ask for reviews of your PRs. Do not comment "can I work on this?" on 50 issues and then do nothing. Quality over quantity, always.',
  },
  {
    icon: '✅',
    title: 'AI as a learning tool, not a shortcut',
    severity: 'positive',
    desc: 'You can use AI tools to help you understand code, explain concepts, or debug — as long as the code you submit is code you understand and wrote. Using AI to learn faster is fine. Using AI to fake competence is not.',
  },
];

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-[#0d0d14]">
      {/* Hero */}
      <div className="relative overflow-hidden pt-14 pb-10 px-4">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-[500px] h-[350px] rounded-full bg-emerald-600/6 blur-[100px]" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[300px] rounded-full bg-blue-600/6 blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-emerald-300/70 mb-6">
            Your guide to open source contribution
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Get{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400">
              Started
            </span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
            Everything you need to know to go from zero to your first merged PR — and beyond.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/8 transition-all">
                {s.title}
              </a>
            ))}
            <a href="#guidelines"
              className="text-xs px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400/70 hover:text-red-400 transition-all">
              Community Guidelines
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-24 space-y-16">

        {/* Dynamic sections */}
        {sections.map(s => (
          <section key={s.id} id={s.id}>
            <h2 className={`text-xl font-bold mb-6 ${s.color}`}>{s.title}</h2>

            {'content' in s && s.content && (
              <div className={`rounded-2xl border ${s.accent} ${s.bg} p-6 space-y-3`}>
                {s.content.map((p, i) => (
                  <p key={i} className="text-white/60 leading-relaxed">{p}</p>
                ))}
                {'cta' in s && s.cta && (
                  <div className="pt-2">
                    <Link href={s.cta.href}
                      className={`inline-flex items-center gap-2 text-sm font-medium ${s.color} hover:opacity-80 transition-opacity`}>
                      {s.cta.label}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {'bullets' in s && s.bullets && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {s.bullets.map((b, i) => (
                  <div key={i} className={`rounded-xl border ${s.accent} ${s.bg} p-4`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{b.icon}</span>
                      <div>
                        <div className={`font-semibold text-sm ${s.color}`}>{b.title}</div>
                        <div className="text-white/50 text-sm mt-1 leading-relaxed">{b.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {'steps' in s && s.steps && (
              <div className="space-y-3">
                {s.steps.map((step, i) => (
                  <div key={i} className={`rounded-xl border ${s.accent} ${s.bg} p-5 flex gap-4`}>
                    <span className={`text-2xl font-bold tabular-nums flex-shrink-0 ${s.color} opacity-60`}>{step.n}</span>
                    <div>
                      <div className="font-semibold text-white/85 text-sm">{step.title}</div>
                      <div className="text-white/50 text-sm mt-1 leading-relaxed">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {'grid' in s && s.grid && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {s.grid.map((col, i) => (
                  <div key={i} className={`rounded-xl border ${s.accent} ${s.bg} p-5`}>
                    <div className={`font-semibold text-sm mb-3 ${s.color}`}>{col.title}</div>
                    <ul className="space-y-1.5">
                      {col.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-white/50 text-sm">
                          <span className="text-white/20 flex-shrink-0 mt-0.5">–</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {/* Guidelines */}
        <section id="guidelines">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-red-400">Community Guidelines</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400">Strict</span>
          </div>
          <p className="text-white/40 text-sm mb-6 leading-relaxed">
            These are not suggestions. Violating these guidelines reflects on you, this community, and NST as a whole.
            Open source maintainers have long memories. Your GitHub username follows you everywhere.
          </p>
          <div className="space-y-3">
            {guidelines.map((g, i) => (
              <div key={i} className={`rounded-xl border p-5 flex gap-4 ${
                g.severity === 'critical' ? 'border-red-500/30 bg-red-500/5' :
                g.severity === 'high'     ? 'border-orange-500/25 bg-orange-500/5' :
                g.severity === 'medium'   ? 'border-yellow-500/20 bg-yellow-500/5' :
                                            'border-emerald-500/25 bg-emerald-500/5'
              }`}>
                <span className="text-2xl flex-shrink-0">{g.icon}</span>
                <div>
                  <div className={`font-semibold text-sm ${
                    g.severity === 'critical' ? 'text-red-400' :
                    g.severity === 'high'     ? 'text-orange-400' :
                    g.severity === 'medium'   ? 'text-yellow-400' :
                                                'text-emerald-400'
                  }`}>{g.title}</div>
                  <div className="text-white/50 text-sm mt-1 leading-relaxed">{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Ready to start?</h2>
          <p className="text-white/40 text-sm mb-6">See who is contributing and find a mentor to guide you.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contributors"
              className="px-5 py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-white/80 text-sm font-medium hover:bg-white/[0.1] transition-all">
              View Contributors
            </Link>
            <Link href="/mentors"
              className="px-5 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-sm font-medium hover:bg-blue-500/20 transition-all">
              Find a Mentor
            </Link>
            <Link href="/achievers"
              className="px-5 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-300 text-sm font-medium hover:bg-yellow-500/15 transition-all">
              Hall of Fame
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
