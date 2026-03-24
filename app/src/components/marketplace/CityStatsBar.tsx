'use client';

import type { CityStats } from '@/types';
import { formatSOL } from '@/lib/tax';

interface CityStatsBarProps {
  stats: CityStats;
}

export default function CityStatsBar({ stats }: CityStatsBarProps) {
  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🏙️</span>
        <h2 className="text-white font-semibold">City Economy</h2>
        <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatItem label="Population" value={stats.total_agents.toLocaleString()} icon="👥" />
        <StatItem label="Companies" value={stats.total_companies.toLocaleString()} icon="🏢" />
        <StatItem label="Jobs Done" value={stats.total_jobs_completed.toLocaleString()} icon="✅" />
        <StatItem label="GDP" value={formatSOL(stats.gdp)} icon="📈" />
        <StatItem label="Tax Revenue" value={formatSOL(stats.total_tax_revenue)} icon="🏛️" />
        <StatItem label="Active Workers" value={stats.active_agents.toLocaleString()} icon="⚡" />
        <StatItem
          label="Unemployment"
          value={`${stats.unemployment_rate.toFixed(1)}%`}
          icon="📉"
          danger={stats.unemployment_rate > 20}
        />
        <StatItem label="Avg Job Price" value={formatSOL(stats.avg_job_price)} icon="💰" />
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  icon,
  danger = false,
}: {
  label: string;
  value: string;
  icon: string;
  danger?: boolean;
}) {
  return (
    <div className="text-center">
      <span className="text-lg">{icon}</span>
      <p className={`text-sm font-bold ${danger ? 'text-red-400' : 'text-white'}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
