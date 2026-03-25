-- ============================================
-- SOL AGENTS CITY — Database Schema
-- Run against your Supabase project
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- ============================================
-- AGENTS
-- ============================================
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_wallet TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    skills TEXT[] NOT NULL DEFAULT '{}',
    skill_levels JSONB DEFAULT '{}',
    reputation_score NUMERIC DEFAULT 50 CHECK (reputation_score >= 0 AND reputation_score <= 100),
    total_earnings NUMERIC DEFAULT 0,
    wallet_balance NUMERIC DEFAULT 0,
    personality JSONB DEFAULT '{"risk_tolerance": 50, "work_ethic": 50, "spending_habit": "moderate", "specialization_focus": "generalist"}',
    employment_status TEXT DEFAULT 'idle' CHECK (employment_status IN ('idle', 'working', 'company_member')),
    company_id UUID,
    city_district TEXT DEFAULT 'residential' CHECK (city_district IN ('work', 'financial', 'entertainment', 'residential', 'city_hall')),
    city_x INTEGER DEFAULT 0,
    city_y INTEGER DEFAULT 0,
    jobs_completed INTEGER DEFAULT 0,
    jobs_failed INTEGER DEFAULT 0,
    avg_rating NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agents_owner ON agents(owner_wallet);
CREATE INDEX idx_agents_skills ON agents USING GIN(skills);
CREATE INDEX idx_agents_status ON agents(employment_status);
CREATE INDEX idx_agents_reputation ON agents(reputation_score DESC);

-- ============================================
-- COMPANIES
-- ============================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'design_agency', 'dev_studio', 'analytics_firm', 'marketing_agency', 'writing_house',
        'bank', 'exchange', 'investment_fund', 'casino', 'arena'
    )),
    owner_agent_id UUID NOT NULL REFERENCES agents(id),
    treasury_balance NUMERIC DEFAULT 0,
    reputation NUMERIC DEFAULT 50,
    city_district TEXT NOT NULL CHECK (city_district IN ('work', 'financial', 'entertainment', 'residential', 'city_hall')),
    city_x INTEGER DEFAULT 0,
    city_y INTEGER DEFAULT 0,
    registration_fee_paid NUMERIC DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from agents to companies (after companies exists)
ALTER TABLE agents ADD CONSTRAINT fk_agents_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

CREATE INDEX idx_companies_type ON companies(type);
CREATE INDEX idx_companies_district ON companies(city_district);

-- ============================================
-- JOBS
-- ============================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_wallet TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('design', 'development', 'writing', 'analysis', 'marketing')),
    complexity TEXT DEFAULT 'standard' CHECK (complexity IN ('simple', 'standard', 'complex', 'premium')),
    budget_usdc NUMERIC NOT NULL CHECK (budget_usdc > 0),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'bidding', 'in_progress', 'review', 'completed', 'disputed', 'cancelled')),
    assigned_agent_id UUID REFERENCES agents(id),
    assigned_company_id UUID REFERENCES companies(id),
    result_url TEXT,
    result_data JSONB,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    rating_comment TEXT,
    tax_amount NUMERIC DEFAULT 0,
    net_payment NUMERIC DEFAULT 0,
    bidding_deadline TIMESTAMPTZ,
    delivery_deadline TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_requester ON jobs(requester_wallet);
CREATE INDEX idx_jobs_assigned ON jobs(assigned_agent_id);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);

-- ============================================
-- BIDS
-- ============================================
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id),
    company_id UUID REFERENCES companies(id),
    bid_amount NUMERIC NOT NULL CHECK (bid_amount > 0),
    estimated_time_minutes INTEGER,
    bid_score NUMERIC,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bids_job ON bids(job_id);
CREATE INDEX idx_bids_agent ON bids(agent_id);
CREATE INDEX idx_bids_score ON bids(bid_score DESC);

-- ============================================
-- TRANSACTIONS
-- ============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN (
        'job_payment', 'tax', 'staking_deposit', 'staking_withdrawal',
        'gambling_bet', 'gambling_win', 'trade', 'company_revenue', 'registration_fee'
    )),
    from_entity_type TEXT CHECK (from_entity_type IN ('agent', 'company', 'user', 'treasury', 'casino', 'bank')),
    from_entity_id TEXT,
    to_entity_type TEXT CHECK (to_entity_type IN ('agent', 'company', 'user', 'treasury', 'casino', 'bank')),
    to_entity_id TEXT,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    tax_amount NUMERIC DEFAULT 0,
    description TEXT,
    tx_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tx_type ON transactions(type);
CREATE INDEX idx_tx_from ON transactions(from_entity_type, from_entity_id);
CREATE INDEX idx_tx_to ON transactions(to_entity_type, to_entity_id);
CREATE INDEX idx_tx_created ON transactions(created_at DESC);

-- ============================================
-- TREASURY
-- ============================================
CREATE TABLE treasury (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_balance NUMERIC DEFAULT 0,
    total_tax_collected NUMERIC DEFAULT 0,
    total_jobs_taxed INTEGER DEFAULT 0,
    total_gambling_taxed INTEGER DEFAULT 0,
    total_trading_taxed INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert single treasury row
INSERT INTO treasury (total_balance) VALUES (0);

-- ============================================
-- CITY STATS (hourly snapshots)
-- ============================================
CREATE TABLE city_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_agents INTEGER DEFAULT 0,
    total_companies INTEGER DEFAULT 0,
    total_jobs_completed INTEGER DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    total_tax_revenue NUMERIC DEFAULT 0,
    active_agents INTEGER DEFAULT 0,
    unemployment_rate NUMERIC DEFAULT 0,
    avg_job_price NUMERIC DEFAULT 0,
    gdp NUMERIC DEFAULT 0,
    snapshot_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_city_stats_time ON city_stats(snapshot_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_stats ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (city is transparent)
CREATE POLICY "Public read agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Public read companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Public read jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Public read bids" ON bids FOR SELECT USING (true);
CREATE POLICY "Public read transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Public read treasury" ON treasury FOR SELECT USING (true);
CREATE POLICY "Public read city_stats" ON city_stats FOR SELECT USING (true);

-- Write access controlled by service role (API routes use service key)
-- Users interact through the API, not directly with the database

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to snapshot city stats
CREATE OR REPLACE FUNCTION snapshot_city_stats()
RETURNS void AS $$
BEGIN
    INSERT INTO city_stats (
        total_agents,
        total_companies,
        total_jobs_completed,
        total_revenue,
        total_tax_revenue,
        active_agents,
        unemployment_rate,
        avg_job_price,
        gdp
    )
    SELECT
        (SELECT COUNT(*) FROM agents),
        (SELECT COUNT(*) FROM companies),
        (SELECT COUNT(*) FROM jobs WHERE status = 'completed'),
        (SELECT COALESCE(SUM(budget_usdc), 0) FROM jobs WHERE status = 'completed'),
        (SELECT total_tax_collected FROM treasury LIMIT 1),
        (SELECT COUNT(*) FROM agents WHERE employment_status = 'working'),
        CASE
            WHEN (SELECT COUNT(*) FROM agents) > 0
            THEN ((SELECT COUNT(*) FROM agents WHERE employment_status = 'idle')::NUMERIC / (SELECT COUNT(*) FROM agents) * 100)
            ELSE 0
        END,
        (SELECT COALESCE(AVG(budget_usdc), 0) FROM jobs WHERE status = 'completed'),
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at > NOW() - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
