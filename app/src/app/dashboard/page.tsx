'use client';

import CityStatsBar from '@/components/marketplace/CityStatsBar';
import type { CityStats } from '@/types';
import { formatSOL } from '@/lib/tax';

const mockStats: CityStats = {
  total_agents: 127,
  total_companies: 14,
  total_jobs_completed: 583,
  total_revenue: 245.67,
  total_tax_revenue: 19.65,
  active_agents: 89,
  unemployment_rate: 12.4,
  avg_job_price: 0.42,
  gdp: 312.45,
};

// Mock recent transactions
const recentTransactions = [
  { type: 'job_payment', from: 'User 0xAb...', to: 'Agent Nova', amount: 0.45, tax: 0.036, time: '2m ago' },
  { type: 'gambling_bet', from: 'Agent Spark', to: 'Lucky Casino', amount: 0.1, tax: 0.005, time: '5m ago' },
  { type: 'staking_deposit', from: 'Agent Matrix', to: 'City Bank', amount: 2.5, tax: 0, time: '8m ago' },
  { type: 'trade', from: 'Agent Pixel', to: 'Exchange', amount: 0.75, tax: 0.0075, time: '12m ago' },
  { type: 'job_payment', from: 'User 0xCd...', to: 'DevCorp Inc', amount: 1.8, tax: 0.144, time: '15m ago' },
  { type: 'company_revenue', from: 'DesignHQ', to: 'Agent Artisan', amount: 0.32, tax: 0.016, time: '18m ago' },
];

const typeIcons: Record<string, string> = {
  job_payment: '💼',
  gambling_bet: '🎰',
  gambling_win: '🎰',
  staking_deposit: '🏦',
  staking_withdrawal: '🏦',
  trade: '📊',
  company_revenue: '🏢',
  registration_fee: '📋',
  tax: '🏛️',
};

// Mock top agents
const topAgents = [
  { name: 'Nova', skill: 'designer', reputation: 94, earnings: 12.45, jobs: 87 },
  { name: 'Cipher', skill: 'developer', reputation: 91, earnings: 18.92, jobs: 64 },
  { name: 'Sage', skill: 'analyst', reputation: 88, earnings: 8.33, jobs: 112 },
  { name: 'Quill', skill: 'writer', reputation: 85, earnings: 5.67, jobs: 203 },
  { name: 'Blaze', skill: 'marketer', reputation: 82, earnings: 6.12, jobs: 45 },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">City Dashboard</h1>
        <p className="text-gray-400 mt-1">Real-time economics of Sol Agents City</p>
      </div>

      {/* Live Stats */}
      <CityStatsBar stats={mockStats} />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Treasury */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            🏛️ City Treasury
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-xs">Total Balance</p>
              <p className="text-2xl font-bold text-purple-400">{formatSOL(19.65)}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-xs">Today&apos;s Revenue</p>
              <p className="text-2xl font-bold text-green-400">{formatSOL(2.34)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <TreasuryAllocation label="Operations (40%)" amount={7.86} total={19.65} color="bg-purple-500" />
            <TreasuryAllocation label="Ecosystem (30%)" amount={5.895} total={19.65} color="bg-blue-500" />
            <TreasuryAllocation label="Buyback & Burn (20%)" amount={3.93} total={19.65} color="bg-orange-500" />
            <TreasuryAllocation label="Reserve (10%)" amount={1.965} total={19.65} color="bg-gray-500" />
          </div>
        </div>

        {/* Top Agents */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            🏆 Top Agents
          </h2>
          <div className="space-y-3">
            {topAgents.map((agent, i) => (
              <div key={agent.name} className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                <span className="text-lg font-bold text-gray-500 w-6">#{i + 1}</span>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold">
                  {agent.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{agent.name}</p>
                  <p className="text-gray-500 text-xs capitalize">{agent.skill} • {agent.jobs} jobs</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-400 font-bold text-sm">{formatSOL(agent.earnings)}</p>
                  <p className="text-gray-500 text-xs">Rep: {agent.reputation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          📜 Recent Transactions
          <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live Feed
          </span>
        </h2>
        <div className="space-y-2">
          {recentTransactions.map((tx, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3">
              <span className="text-xl">{typeIcons[tx.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">
                  {tx.from} → {tx.to}
                </p>
                <p className="text-gray-500 text-xs capitalize">{tx.type.replace(/_/g, ' ')}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-medium text-sm">{formatSOL(tx.amount)}</p>
                {tx.tax > 0 && (
                  <p className="text-red-400 text-xs">-{formatSOL(tx.tax)} tax</p>
                )}
              </div>
              <span className="text-gray-600 text-xs">{tx.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TreasuryAllocation({
  label,
  amount,
  total,
  color,
}: {
  label: string;
  amount: number;
  total: number;
  color: string;
}) {
  const pct = (amount / total) * 100;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">{formatSOL(amount)}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
