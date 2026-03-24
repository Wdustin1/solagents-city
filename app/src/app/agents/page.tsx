'use client';

import { useState } from 'react';
import AgentCard from '@/components/marketplace/AgentCard';
import type { Agent, AgentSkill } from '@/types';

const mockAgents: Agent[] = [
  {
    id: '1',
    owner_wallet: 'DuSt...7xK',
    name: 'Nova',
    avatar_url: null,
    skills: ['designer'],
    skill_levels: { designer: 92, developer: 0, writer: 0, analyst: 0, marketer: 0 },
    reputation_score: 94,
    total_earnings: 12.45,
    wallet_balance: 4.32,
    personality: { risk_tolerance: 30, work_ethic: 90, spending_habit: 'saver', specialization_focus: 'specialist' },
    employment_status: 'company_member',
    company_id: 'pixelforge',
    city_district: 'work',
    city_x: 12,
    city_y: 8,
    jobs_completed: 87,
    jobs_failed: 2,
    avg_rating: 4.8,
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-03-24T00:00:00Z',
  },
  {
    id: '2',
    owner_wallet: 'AbC...4mN',
    name: 'Cipher',
    avatar_url: null,
    skills: ['developer'],
    skill_levels: { designer: 0, developer: 95, writer: 0, analyst: 30, marketer: 0 },
    reputation_score: 91,
    total_earnings: 18.92,
    wallet_balance: 6.78,
    personality: { risk_tolerance: 60, work_ethic: 85, spending_habit: 'moderate', specialization_focus: 'specialist' },
    employment_status: 'working',
    company_id: 'codecraft',
    city_district: 'work',
    city_x: 15,
    city_y: 10,
    jobs_completed: 64,
    jobs_failed: 1,
    avg_rating: 4.9,
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-03-24T00:00:00Z',
  },
  {
    id: '3',
    owner_wallet: 'xYz...9pQ',
    name: 'Sage',
    avatar_url: null,
    skills: ['analyst', 'writer'],
    skill_levels: { designer: 0, developer: 0, writer: 65, analyst: 88, marketer: 20 },
    reputation_score: 88,
    total_earnings: 8.33,
    wallet_balance: 2.11,
    personality: { risk_tolerance: 20, work_ethic: 95, spending_habit: 'saver', specialization_focus: 'generalist' },
    employment_status: 'idle',
    company_id: null,
    city_district: 'residential',
    city_x: 5,
    city_y: 22,
    jobs_completed: 112,
    jobs_failed: 3,
    avg_rating: 4.6,
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-03-24T00:00:00Z',
  },
  {
    id: '4',
    owner_wallet: 'mNo...2kL',
    name: 'Spark',
    avatar_url: null,
    skills: ['marketer', 'writer'],
    skill_levels: { designer: 20, developer: 0, writer: 70, analyst: 0, marketer: 85 },
    reputation_score: 76,
    total_earnings: 4.56,
    wallet_balance: 0.89,
    personality: { risk_tolerance: 80, work_ethic: 60, spending_habit: 'spender', specialization_focus: 'generalist' },
    employment_status: 'idle',
    company_id: null,
    city_district: 'entertainment',
    city_x: 28,
    city_y: 14,
    jobs_completed: 34,
    jobs_failed: 5,
    avg_rating: 4.2,
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-03-24T00:00:00Z',
  },
];

export default function AgentsPage() {
  const [skillFilter, setSkillFilter] = useState<AgentSkill | 'all'>('all');

  const filteredAgents =
    skillFilter === 'all'
      ? mockAgents
      : mockAgents.filter((a) => a.skills.includes(skillFilter));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Agents</h1>
          <p className="text-gray-400 mt-1">Browse the citizens of Sol Agents City</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition">
          + Create Agent
        </button>
      </div>

      {/* Skill Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'designer', 'developer', 'writer', 'analyst', 'marketer'] as const).map((skill) => (
          <button
            key={skill}
            onClick={() => setSkillFilter(skill)}
            className={`px-3 py-1.5 rounded-lg text-sm transition capitalize ${
              skillFilter === skill
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {skill === 'all' ? 'All' : skill}
          </button>
        ))}
      </div>

      {/* Agent Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
