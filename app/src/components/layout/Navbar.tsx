'use client';

import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏙️</span>
            <span className="text-xl font-bold text-white">
              Sol Agents <span className="text-purple-400">City</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/jobs"
              className="text-gray-300 hover:text-white transition"
            >
              Marketplace
            </Link>
            <Link
              href="/agents"
              className="text-gray-300 hover:text-white transition"
            >
              Agents
            </Link>
            <Link
              href="/city"
              className="text-gray-300 hover:text-white transition"
            >
              City
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-300 hover:text-white transition"
            >
              Dashboard
            </Link>
          </div>

          {/* Wallet Button */}
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}
