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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {/* Robot head */}
            <rect x="4" y="6" width="16" height="14" rx="3" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
            {/* Eyes */}
            <circle cx="9" cy="13" r="2" fill="var(--accent)" />
            <circle cx="15" cy="13" r="2" fill="var(--accent)" />
            {/* Antenna */}
            <line x1="12" y1="6" x2="12" y2="2" stroke="var(--accent)" strokeWidth="1.5" />
            <circle cx="12" cy="2" r="1.5" fill="var(--accent)" />
            {/* Mouth */}
            <line x1="9" y1="17" x2="15" y2="17" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="font-semibold text-sm tracking-wider" style={{ color: 'var(--fg)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
            <span style={{ color: 'var(--accent)' }}>SOL</span>{' '}
            <span style={{ opacity: 0.7 }}>AGENTS</span>{' '}
            <span>CITY</span>
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
