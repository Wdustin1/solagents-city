import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { calculateTax } from '@/lib/tax';
import { calculateNewReputation } from '@/lib/reputation';
import type { Agent } from '@/types';

// POST /api/jobs/[id]/complete — complete a job + pay agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  const body = await request.json();
  const { rating, rating_comment, result_url, result_data } = body;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating (1-5) is required' }, { status: 400 });
  }

  // Fetch job
  const { data: job, error: jobErr } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobErr || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.status !== 'in_progress' && job.status !== 'review') {
    return NextResponse.json({ error: 'Job is not in progress' }, { status: 400 });
  }

  // Calculate tax
  const taxResult = calculateTax(job.budget_usdc, 'job_payment');

  // Fetch agent
  const { data: agent, error: agentErr } = await supabaseAdmin
    .from('agents')
    .select('*')
    .eq('id', job.assigned_agent_id)
    .single();

  if (agentErr || !agent) {
    return NextResponse.json({ error: 'Assigned agent not found' }, { status: 500 });
  }

  // Calculate new reputation
  const newRep = calculateNewReputation(agent as Agent, rating);

  // Transaction: update job, agent, treasury
  // 1. Update job
  const { error: updateJobErr } = await supabaseAdmin
    .from('jobs')
    .update({
      status: 'completed',
      rating,
      rating_comment,
      result_url,
      result_data,
      tax_amount: taxResult.tax,
      net_payment: taxResult.net,
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (updateJobErr) {
    return NextResponse.json({ error: updateJobErr.message }, { status: 500 });
  }

  // 2. Update agent
  const { error: updateAgentErr } = await supabaseAdmin
    .from('agents')
    .update({
      reputation_score: newRep,
      total_earnings: agent.total_earnings + taxResult.net,
      wallet_balance: agent.wallet_balance + taxResult.net,
      jobs_completed: agent.jobs_completed + 1,
      avg_rating: ((agent.avg_rating * agent.jobs_completed) + rating) / (agent.jobs_completed + 1),
      employment_status: 'idle',
    })
    .eq('id', job.assigned_agent_id);

  if (updateAgentErr) {
    return NextResponse.json({ error: updateAgentErr.message }, { status: 500 });
  }

  // 3. Update treasury
  const { data: treasury } = await supabaseAdmin.from('treasury').select('*').single();
  if (treasury) {
    await supabaseAdmin
      .from('treasury')
      .update({
        total_balance: treasury.total_balance + taxResult.tax,
        total_tax_collected: treasury.total_tax_collected + taxResult.tax,
        total_jobs_taxed: treasury.total_jobs_taxed + 1,
      })
      .eq('id', treasury.id);
  }

  // 4. Record transactions
  await supabaseAdmin.from('transactions').insert([
    {
      type: 'job_payment',
      from_entity_type: 'user',
      from_entity_id: job.requester_wallet,
      to_entity_type: 'agent',
      to_entity_id: job.assigned_agent_id,
      amount: taxResult.net,
      tax_amount: taxResult.tax,
      description: `Payment for job: ${job.title}`,
    },
    {
      type: 'tax',
      from_entity_type: 'agent',
      from_entity_id: job.assigned_agent_id,
      to_entity_type: 'treasury',
      to_entity_id: 'city',
      amount: taxResult.tax,
      description: `Income tax on job: ${job.title}`,
    },
  ]);

  return NextResponse.json({
    message: 'Job completed',
    job_id: jobId,
    agent_id: job.assigned_agent_id,
    payment: {
      gross: taxResult.gross,
      tax: taxResult.tax,
      net: taxResult.net,
      tax_rate: `${taxResult.effectiveRate}%`,
    },
    new_reputation: newRep,
  });
}
