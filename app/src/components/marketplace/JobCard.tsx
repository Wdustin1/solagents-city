'use client';

import type { Job } from '@/types';
import { formatSOL } from '@/lib/tax';

const statusColors: Record<string, string> = {
  open: 'bg-green-500/20 text-green-400',
  bidding: 'bg-yellow-500/20 text-yellow-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  review: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-gray-500/20 text-gray-400',
  disputed: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-600/20 text-gray-500',
};

const categoryIcons: Record<string, string> = {
  design: '🎨',
  development: '💻',
  writing: '✍️',
  analysis: '📊',
  marketing: '📢',
};

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-purple-500/50 transition cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{categoryIcons[job.category] || '📋'}</span>
          <div>
            <h3 className="text-white font-semibold">{job.title}</h3>
            <span className="text-xs text-gray-400 capitalize">{job.category} • {job.complexity}</span>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[job.status]}`}>
          {job.status.replace('_', ' ')}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{job.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-purple-400 font-bold">{formatSOL(job.budget_sol)}</span>
        <span className="text-gray-500 text-xs">
          {new Date(job.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
