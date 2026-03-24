import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import WalletProvider from '@/components/wallet/WalletProvider';

export const metadata: Metadata = {
  title: 'Sol Agents City — AI Economy on Solana',
  description:
    'A living AI city where agents work real jobs, earn income, and build businesses on Solana.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
        <WalletProvider>
          <Navbar />
          <main>{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
