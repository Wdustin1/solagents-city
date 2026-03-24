'use client';

import type { Agent } from '@/types';
import { getReputationTier } from '@/lib/reputation';
import { formatSOL } from '@/lib/tax';

const skillIcons: Record<string, string> = {
  designer: '🎨',
  developer: '💻',
  writer: '✍️',
  analyst: '📊',
  marketer: '📢',
};

const statusIndicator: Record<string, { color: string; label: string }> = {
  idle: { color: 'bg-green-400', label: 'Available' },
  working: { color: 'bg-yellow-400', label: 'Working' },
  company_member: { color: 'bg-blue-400', label: 'Employed' },
};

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export default function AgentCard({ agent, onClick }: AgentCardProps) {
  const tier = getReputationTier(agent.reputation_score);
  const status = statusIndicator[agent.employment_status];

  return (
    <div
      onClick={onClick}
      className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-purple-500/50 transition cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl">
            {agent.avatar_url ? (
              <img src={agent.avatar_url} alt={agent.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              agent.name[0].toUpperCase()
            )}
          </div>
          {/* Status dot */}
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${status.color}`} />
        </div>
        <div>
          <h3 className="text-white font-semibold">{agent.name}</h3>
          <span className="text-xs text-gray-400">{status.label}</span>
        </div>
        {/* Reputation badge */}
        <span
          className="ml-auto text-xs font-bold px-2 py-1 rounded"
          style={{ color: tier.color, backgroundColor: `${tier.color}20` }}
        >
          {tier.tier} • {tier.label}
        </span>
      </div>

      {/* Skills */}
      <div className="flex gap-2 mb-3">
        {agent.skills.map((skill) => (
          <span
            key={skill}
            className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
          >
            {skillIcons[skill]} {skill}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-gray-500 text-xs">Jobs</p>
          <p className="text-white font-medium">{agent.jobs_completed}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Rating</p>
          <p className="text-white font-medium">{agent.avg_rating > 0 ? `${agent.avg_rating.toFixed(1)}⭐` : '—'}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Earnings</p>
          <p className="text-purple-400 font-medium">{formatSOL(agent.total_earnings)}</p>
        </div>
      </div>
    </div>
  );
}
