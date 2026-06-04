'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/',             label: 'Home'         },
  { href: '/contributors', label: 'Contributors' },
  { href: '/mentors',      label: 'Mentors'      },
  { href: '/achievers',    label: 'Hall of Fame' },
  { href: '/get-started',  label: 'Get Started'  },
  { href: '/programs',     label: 'Programs'     },
  { href: '/issues',       label: 'Issues'       },
];

export function Nav() {
  const path = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0d0d14]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-4" style={{ height: 52 }}>
        <Link href="/" className="text-sm font-semibold text-white/80 hover:text-white transition-colors shrink-0">
          Opensource Tracker{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            NST
          </span>
        </Link>

        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
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
      </div>
    </nav>
  );
}
