import type { Agent, Job, Bid } from '@/types';

/**
 * Calculate a bid score for an agent on a job.
 * Score = (reputation * 0.6) + (speed_rating * 0.2) + (price_competitiveness * 0.2)
 */
export function calculateBidScore(
  agent: Agent,
  bid: { bid_amount: number; estimated_time_minutes: number },
  job: Job
): number {
  // Reputation component (0-100 normalized to 0-1)
  const reputationScore = agent.reputation_score / 100;

  // Speed component — faster delivery = higher score
  // Normalize: assume max reasonable time is 1440 min (24h)
  const maxTime = 1440;
  const speedScore = Math.max(0, 1 - bid.estimated_time_minutes / maxTime);

  // Price competitiveness — lower bid relative to budget = higher score
  const priceScore = Math.max(0, 1 - bid.bid_amount / job.budget_usdc);

  // Weighted score
  const score = reputationScore * 0.6 + speedScore * 0.2 + priceScore * 0.2;

  return Math.round(score * 10000) / 10000; // 4 decimal precision
}

/**
 * Select the winning bid from a list of bids.
 * Returns the bid with the highest score.
 */
export function selectWinningBid(bids: (Bid & { agent: Agent })[], job: Job): Bid | null {
  if (bids.length === 0) return null;

  let bestBid: Bid | null = null;
  let bestScore = -1;

  for (const bid of bids) {
    const score = calculateBidScore(bid.agent, bid, job);
    if (score > bestScore) {
      bestScore = score;
      bestBid = bid;
    }
  }

  return bestBid;
}

/**
 * Check if an agent is qualified to bid on a job.
 */
export function isQualifiedForJob(agent: Agent, job: Job): boolean {
  // Map job categories to required skills
  const categorySkillMap: Record<string, string[]> = {
    design: ['designer'],
    development: ['developer'],
    writing: ['writer'],
    analysis: ['analyst'],
    marketing: ['marketer'],
  };

  const requiredSkills = categorySkillMap[job.category] || [];
  const hasSkill = requiredSkills.some((skill) => agent.skills.includes(skill as any));

  // Minimum reputation threshold
  const meetsReputation = agent.reputation_score >= 20;

  // Not currently busy
  const isAvailable = agent.employment_status !== 'working';

  return hasSkill && meetsReputation && isAvailable;
}

/**
 * Get default bidding window duration in ms based on job complexity.
 */
export function getBiddingWindow(complexity: string): number {
  switch (complexity) {
    case 'simple':
      return 30 * 1000; // 30 seconds
    case 'standard':
      return 60 * 1000; // 1 minute
    case 'complex':
      return 3 * 60 * 1000; // 3 minutes
    case 'premium':
      return 5 * 60 * 1000; // 5 minutes
    default:
      return 60 * 1000;
  }
}
