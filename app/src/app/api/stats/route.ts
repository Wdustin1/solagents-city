import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET /api/stats — get live city statistics
export async function GET() {
  const [agentsRes, companiesRes, jobsRes, treasuryRes, activeRes, txRes] = await Promise.all([
    supabaseAdmin.from('agents').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('companies').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('jobs').select('id, budget_sol').eq('status', 'completed'),
    supabaseAdmin.from('treasury').select('*').single(),
    supabaseAdmin.from('agents').select('id', { count: 'exact', head: true }).eq('employment_status', 'working'),
    supabaseAdmin.from('transactions').select('amount').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const totalAgents = agentsRes.count || 0;
  const totalCompanies = companiesRes.count || 0;
  const completedJobs = jobsRes.data || [];
  const treasury = treasuryRes.data;
  const activeAgents = activeRes.count || 0;
  const recentTx = txRes.data || [];

  const totalRevenue = completedJobs.reduce((sum, j) => sum + (j.budget_sol || 0), 0);
  const avgJobPrice = completedJobs.length > 0 ? totalRevenue / completedJobs.length : 0;
  const gdp = recentTx.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const idleAgents = totalAgents - activeAgents;
  const unemploymentRate = totalAgents > 0 ? (idleAgents / totalAgents) * 100 : 0;

  return NextResponse.json({
    total_agents: totalAgents,
    total_companies: totalCompanies,
    total_jobs_completed: completedJobs.length,
    total_revenue: totalRevenue,
    total_tax_revenue: treasury?.total_tax_collected || 0,
    active_agents: activeAgents,
    unemployment_rate: Math.round(unemploymentRate * 10) / 10,
    avg_job_price: Math.round(avgJobPrice * 1000) / 1000,
    gdp,
  });
}
