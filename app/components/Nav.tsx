'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';


const LINKS = [
  { href: '/',             label: 'Home'         },
  { href: '/contributors', label: 'Contributors' },
  { href: '/join',         label: 'Join Tracker' },
  { href: '/check-work',   label: 'Check My Work'},
  { href: '/repo-activity', label: 'Repo Activity'},
  { href: '/achievers',    label: 'Hall of Fame' },
  { href: '/programs',     label: 'Programs'     },
  { href: '/get-started',  label: 'Get Started'  },
  { href: '/issues',       label: 'Issues'       },
];

interface Session {
  authenticated: boolean;
  user?: {
    username: string;
    name: string;
    avatarUrl: string;
  };
}

function GitHubIcon() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Load session info on mount and when path changes
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      }
    }
    checkSession();
  }, [path]);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [path]);
  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030712]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-4" style={{ height: 52 }}>
          {/* Logo */}
          <Link href="/" className="text-sm font-semibold text-white/80 hover:text-white transition-colors shrink-0">
            Opensource Tracker{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              NST
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5 overflow-x-auto scrollbar-none">
            {LINKS.map(({ href, label }) => {
              const active = href === '/' ? path === '/' : path === href || path.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm transition-all ${
                    active
                      ? 'bg-white/[0.07] text-white'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* GitHub Session Info / Sign In */}
            {session && (
              session.authenticated && session.user ? (
                <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-xl">
                  <img
                    src={session.user.avatarUrl}
                    alt={session.user.name}
                    className="w-5 h-5 rounded-full border border-white/15 shrink-0"
                  />
                  <span className="text-white/70 text-xs hidden md:inline max-w-[100px] truncate">
                    @{session.user.username}
                  </span>
                  <a
                    href="/api/auth/logout"
                    title="Sign Out"
                    className="text-white/30 hover:text-red-400 hover:bg-red-500/10 p-1 rounded-md transition-all shrink-0 ml-0.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </a>
                </div>
              ) : (
                <a
                  href="/api/auth/github"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] text-white/90 transition-all shadow-md shadow-black/10"
                >
                  <GitHubIcon />
                  <span>Sign In</span>
                </a>
              )
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/[0.05] transition-all"
            >
              <span className={`block h-px w-4 bg-white/50 transition-all duration-200 ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block h-px w-4 bg-white/50 transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-px w-4 bg-white/50 transition-all duration-200 ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-out menu */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          {/* Panel */}
          <div className="absolute top-[52px] left-0 right-0 bg-[#030712] border-b border-white/[0.08] shadow-2xl shadow-black/40">
            <div className="flex flex-col py-2 px-2">
              {LINKS.map(({ href, label }) => {
                const active = href === '/' ? path === '/' : path === href || path.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                      active ? 'bg-white/[0.07] text-white font-medium' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {label}
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />}
                  </Link>
                );
              })}

              {/* Mobile GitHub Auth Link */}
              {session && (
                <div className="border-t border-white/[0.08] mt-2 pt-2 px-2 pb-2">
                  {session.authenticated && session.user ? (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                      <div className="flex items-center gap-3">
                        <img
                          src={session.user.avatarUrl}
                          alt={session.user.name}
                          className="w-8 h-8 rounded-full border border-white/10"
                        />
                        <div>
                          <div className="text-white text-sm font-medium">{session.user.name}</div>
                          <div className="text-white/40 text-xs">@{session.user.username}</div>
                        </div>
                      </div>
                      <a
                        href="/api/auth/logout"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                      >
                        Sign Out
                      </a>
                    </div>
                  ) : (
                    <a
                      href="/api/auth/github"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <GitHubIcon />
                      Sign In with GitHub
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
