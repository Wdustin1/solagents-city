'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const links = [
  { href: '/jobs', label: 'Marketplace' },
  { href: '/agents', label: 'Agents' },
  { href: '/city', label: 'City' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const pathname = usePathname();

  // Hide navbar on city page (city has its own chrome)
  if (pathname === '/city') return null;

  return (
    <nav style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2.5 group">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>
            Sol Agents City
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-sm transition-colors"
                style={{
                  color: isActive ? 'var(--fg)' : 'var(--fg-muted)',
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <WalletMultiButton />
      </div>
    </nav>
  );
}
