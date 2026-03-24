// ============================================
// SOL AGENTS CITY — Core Type Definitions
// ============================================

// --- Agent Types ---

export type AgentSkill = 'designer' | 'developer' | 'writer' | 'analyst' | 'marketer';

export type SpendingHabit = 'saver' | 'moderate' | 'spender';

export type EmploymentStatus = 'idle' | 'working' | 'company_member';

export type CityDistrict = 'work' | 'financial' | 'entertainment' | 'residential' | 'city_hall';

export interface AgentPersonality {
  risk_tolerance: number; // 0-100
  work_ethic: number; // 0-100
  spending_habit: SpendingHabit;
  specialization_focus: 'generalist' | 'specialist';
}

export interface Agent {
  id: string;
  owner_wallet: string;
  name: string;
  avatar_url: string | null;
  skills: AgentSkill[];
  skill_levels: Record<AgentSkill, number>;
  reputation_score: number;
  total_earnings: number;
  wallet_balance: number;
  personality: AgentPersonality;
  employment_status: EmploymentStatus;
  company_id: string | null;
  city_district: CityDistrict;
  city_x: number;
  city_y: number;
  jobs_completed: number;
  jobs_failed: number;
  avg_rating: number;
  created_at: string;
  updated_at: string;
}

// --- Company Types ---

export type CompanyType =
  | 'design_agency'
  | 'dev_studio'
  | 'analytics_firm'
  | 'marketing_agency'
  | 'writing_house'
  | 'bank'
  | 'exchange'
  | 'investment_fund'
  | 'casino'
  | 'arena';

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  owner_agent_id: string;
  treasury_balance: number;
  reputation: number;
  city_district: CityDistrict;
  city_x: number;
  city_y: number;
  registration_fee_paid: number;
  total_revenue: number;
  total_jobs: number;
  member_count: number;
  created_at: string;
}

// --- Job Types ---

export type JobCategory = 'design' | 'development' | 'writing' | 'analysis' | 'marketing';

export type JobComplexity = 'simple' | 'standard' | 'complex' | 'premium';

export type JobStatus =
  | 'open'
  | 'bidding'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export interface Job {
  id: string;
  requester_wallet: string;
  title: string;
  description: string;
  category: JobCategory;
  complexity: JobComplexity;
  budget_sol: number;
  status: JobStatus;
  assigned_agent_id: string | null;
  assigned_company_id: string | null;
  result_url: string | null;
  result_data: Record<string, unknown> | null;
  rating: number | null;
  rating_comment: string | null;
  tax_amount: number;
  net_payment: number;
  bidding_deadline: string | null;
  delivery_deadline: string | null;
  completed_at: string | null;
  created_at: string;
}

// --- Bid Types ---

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface Bid {
  id: string;
  job_id: string;
  agent_id: string;
  company_id: string | null;
  bid_amount: number;
  estimated_time_minutes: number;
  bid_score: number;
  status: BidStatus;
  created_at: string;
}

// --- Transaction Types ---

export type TransactionType =
  | 'job_payment'
  | 'tax'
  | 'staking_deposit'
  | 'staking_withdrawal'
  | 'gambling_bet'
  | 'gambling_win'
  | 'trade'
  | 'company_revenue'
  | 'registration_fee';

export type EntityType = 'agent' | 'company' | 'user' | 'treasury' | 'casino' | 'bank';

export interface Transaction {
  id: string;
  type: TransactionType;
  from_entity_type: EntityType;
  from_entity_id: string;
  to_entity_type: EntityType;
  to_entity_id: string;
  amount: number;
  tax_amount: number;
  description: string;
  tx_signature: string | null;
  created_at: string;
}

// --- City Stats ---

export interface CityStats {
  total_agents: number;
  total_companies: number;
  total_jobs_completed: number;
  total_revenue: number;
  total_tax_revenue: number;
  active_agents: number;
  unemployment_rate: number;
  avg_job_price: number;
  gdp: number;
}

// --- Tax Rates ---

export const TAX_RATES = {
  income: 0.08,        // 8% on job payments
  company: 0.05,       // 5% on company revenue
  sales: 0.02,         // 2% on in-city purchases
  gambling: 0.05,      // 5% on casino bets
  trading: 0.01,       // 1% on exchange swaps
  staking_fee: 0.02,   // 2% of staking yield
} as const;

// --- API Types ---

export interface CreateAgentRequest {
  name: string;
  skills: AgentSkill[];
  personality?: Partial<AgentPersonality>;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  category: JobCategory;
  complexity?: JobComplexity;
  budget_sol: number;
}

export interface SubmitBidRequest {
  job_id: string;
  agent_id: string;
  bid_amount: number;
  estimated_time_minutes: number;
}
