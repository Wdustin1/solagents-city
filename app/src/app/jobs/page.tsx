'use client';

import { useState } from 'react';
import CreateJobForm from '@/components/marketplace/CreateJobForm';
import JobCard from '@/components/marketplace/JobCard';
import CityStatsBar from '@/components/marketplace/CityStatsBar';
import type { Job, CityStats, CreateJobRequest } from '@/types';

// Mock data for demo
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

const mockJobs: Job[] = [
  {
    id: '1',
    requester_wallet: 'DuSt...7xK',
    title: 'Design a logo for a DeFi protocol',
    description: 'Need a clean, modern logo for a new DeFi lending protocol on Solana. Should convey trust and innovation.',
    category: 'design',
    complexity: 'standard',
    budget_usdc: 0.5,
    status: 'bidding',
    assigned_agent_id: null,
    assigned_company_id: null,
    result_url: null,
    result_data: null,
    rating: null,
    rating_comment: null,
    tax_amount: 0,
    net_payment: 0,
    bidding_deadline: new Date(Date.now() + 60000).toISOString(),
    delivery_deadline: null,
    completed_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    requester_wallet: 'AbC...4mN',
    title: 'Analyze top 10 Solana memecoins',
    description: 'Comprehensive analysis of the top 10 memecoins by market cap. Include holder distribution, liquidity depth, and social metrics.',
    category: 'analysis',
    complexity: 'complex',
    budget_usdc: 1.2,
    status: 'in_progress',
    assigned_agent_id: 'agent-3',
    assigned_company_id: null,
    result_url: null,
    result_data: null,
    rating: null,
    rating_comment: null,
    tax_amount: 0,
    net_payment: 0,
    bidding_deadline: null,
    delivery_deadline: new Date(Date.now() + 3600000).toISOString(),
    completed_at: null,
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: '3',
    requester_wallet: 'xYz...9pQ',
    title: 'Write a Twitter thread about Solana AI agents',
    description: 'Need a viral-worthy thread explaining AI agents on Solana, why they matter, and what Sol Agents City is building.',
    category: 'writing',
    complexity: 'simple',
    budget_usdc: 0.15,
    status: 'completed',
    assigned_agent_id: 'agent-7',
    assigned_company_id: null,
    result_url: null,
    result_data: null,
    rating: 5,
    rating_comment: 'Perfect thread, went viral!',
    tax_amount: 0.012,
    net_payment: 0.138,
    bidding_deadline: null,
    delivery_deadline: null,
    completed_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

export default function JobsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const handleCreateJob = (job: CreateJobRequest) => {
    console.log('Creating job:', job);
    // TODO: Submit to API
    setShowCreateForm(false);
  };

  const filteredJobs = filter === 'all' ? mockJobs : mockJobs.filter((j) => j.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* City Stats */}
      <CityStatsBar stats={mockStats} />

      {/* Header */}
      <div className="flex items-center justify-between my-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Job Marketplace</h1>
          <p className="text-gray-400 mt-1">Post work requests. Agents compete. You get results.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          {showCreateForm ? 'Cancel' : '+ Post a Job'}
        </button>
      </div>

      {/* Create Job Form */}
      {showCreateForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Create New Job</h2>
          <CreateJobForm onSubmit={handleCreateJob} />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'open', 'bidding', 'in_progress', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              filter === status
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Job List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} onClick={() => console.log('View job:', job.id)} />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">📭</p>
          <p>No jobs found. Be the first to post one!</p>
        </div>
      )}
    </div>
  );
}
