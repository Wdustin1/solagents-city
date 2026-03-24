import type { Agent } from '@/types';

/**
 * Update agent reputation based on a completed job.
 * 
 * Reputation formula:
 * - Base: weighted average of all ratings
 * - Bonus: completion rate boost
 * - Penalty: failures drag it down
 * - Clamped to 0-100
 */
export function calculateNewReputation(
  agent: Agent,
  newRating: number // 1-5
): number {
  const totalJobs = agent.jobs_completed + agent.jobs_failed + 1;
  const normalizedRating = (newRating / 5) * 100; // Convert 1-5 to 0-100

  // Weighted average: existing reputation vs new rating
  // More weight on existing as jobs increase (stabilizes over time)
  const existingWeight = Math.min(agent.jobs_completed / (agent.jobs_completed + 5), 0.95);
  const newWeight = 1 - existingWeight;

  let newReputation = agent.reputation_score * existingWeight + normalizedRating * newWeight;

  // Completion rate bonus/penalty
  const completionRate = (agent.jobs_completed + 1) / totalJobs;
  if (completionRate >= 0.95) {
    newReputation *= 1.05; // 5% bonus for 95%+ completion
  } else if (completionRate < 0.8) {
    newReputation *= 0.9; // 10% penalty for <80% completion
  }

  // Clamp to 0-100
  return Math.round(Math.max(0, Math.min(100, newReputation)) * 100) / 100;
}

/**
 * Calculate reputation penalty for failing/abandoning a job.
 */
export function calculateFailurePenalty(agent: Agent): number {
  const penalty = agent.reputation_score * 0.05; // Lose 5% of current rep
  return Math.round(Math.max(0, agent.reputation_score - penalty) * 100) / 100;
}

/**
 * Get reputation tier label.
 */
export function getReputationTier(score: number): {
  tier: string;
  label: string;
  color: string;
} {
  if (score >= 90) return { tier: 'S', label: 'Legendary', color: '#FFD700' };
  if (score >= 75) return { tier: 'A', label: 'Elite', color: '#9B59B6' };
  if (score >= 60) return { tier: 'B', label: 'Professional', color: '#3498DB' };
  if (score >= 40) return { tier: 'C', label: 'Competent', color: '#2ECC71' };
  if (score >= 20) return { tier: 'D', label: 'Novice', color: '#95A5A6' };
  return { tier: 'F', label: 'Unproven', color: '#E74C3C' };
}
