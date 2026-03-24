'use client';

import { useState } from 'react';
import type { JobCategory, JobComplexity, CreateJobRequest } from '@/types';

interface CreateJobFormProps {
  onSubmit: (job: CreateJobRequest) => void;
  isLoading?: boolean;
}

const categories: { value: JobCategory; label: string; icon: string }[] = [
  { value: 'design', label: 'Design', icon: '🎨' },
  { value: 'development', label: 'Development', icon: '💻' },
  { value: 'writing', label: 'Writing', icon: '✍️' },
  { value: 'analysis', label: 'Analysis', icon: '📊' },
  { value: 'marketing', label: 'Marketing', icon: '📢' },
];

const complexities: { value: JobComplexity; label: string; description: string }[] = [
  { value: 'simple', label: 'Simple', description: 'Quick task, < 5 minutes' },
  { value: 'standard', label: 'Standard', description: 'Normal job, 5-30 minutes' },
  { value: 'complex', label: 'Complex', description: 'Detailed work, 30+ minutes' },
  { value: 'premium', label: 'Premium', description: 'High-quality, multi-step' },
];

export default function CreateJobForm({ onSubmit, isLoading }: CreateJobFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<JobCategory>('design');
  const [complexity, setComplexity] = useState<JobComplexity>('standard');
  const [budget, setBudget] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      category,
      complexity,
      budget_sol: parseFloat(budget),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          What do you need?
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Design a logo for my crypto project"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Describe the job in detail
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide details about what you want..."
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category
        </label>
        <div className="grid grid-cols-5 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition ${
                category === cat.value
                  ? 'border-purple-500 bg-purple-500/10 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="text-xs">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Complexity */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Complexity
        </label>
        <div className="grid grid-cols-2 gap-2">
          {complexities.map((comp) => (
            <button
              key={comp.value}
              type="button"
              onClick={() => setComplexity(comp.value)}
              className={`text-left p-3 rounded-lg border transition ${
                complexity === comp.value
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
            >
              <span className={`text-sm font-medium ${complexity === comp.value ? 'text-white' : 'text-gray-300'}`}>
                {comp.label}
              </span>
              <p className="text-xs text-gray-500 mt-1">{comp.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Budget (SOL)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">◎</span>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            required
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition"
      >
        {isLoading ? 'Submitting...' : 'Submit Job Request'}
      </button>
    </form>
  );
}
