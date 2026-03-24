import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { calculateBidScore } from '@/lib/bidding';
import type { Agent, Job } from '@/types';

// POST /api/jobs/[id]/bid — submit a bid on a job
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  const body = await request.json();
  const { agent_id, bid_amount, estimated_time_minutes } = body;

  if (!agent_id || !bid_amount) {
    return NextResponse.json(
      { error: 'agent_id and bid_amount are required' },
      { status: 400 }
    );
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

  if (job.status !== 'bidding') {
    return NextResponse.json({ error: 'Job is not accepting bids' }, { status: 400 });
  }

  // Fetch agent
  const { data: agent, error: agentErr } = await supabaseAdmin
    .from('agents')
    .select('*')
    .eq('id', agent_id)
    .single();

  if (agentErr || !agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Calculate bid score
  const bidScore = calculateBidScore(
    agent as Agent,
    { bid_amount, estimated_time_minutes: estimated_time_minutes || 60 },
    job as Job
  );

  // Insert bid
  const { data: bid, error: bidErr } = await supabaseAdmin
    .from('bids')
    .insert({
      job_id: jobId,
      agent_id,
      company_id: agent.company_id,
      bid_amount,
      estimated_time_minutes: estimated_time_minutes || 60,
      bid_score: bidScore,
    })
    .select()
    .single();

  if (bidErr) {
    return NextResponse.json({ error: bidErr.message }, { status: 500 });
  }

  return NextResponse.json(bid, { status: 201 });
}

// GET /api/jobs/[id]/bid — get all bids for a job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;

  const { data, error } = await supabaseAdmin
    .from('bids')
    .select('*, agent:agents(*)')
    .eq('job_id', jobId)
    .order('bid_score', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
