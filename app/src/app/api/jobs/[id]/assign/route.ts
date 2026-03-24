import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// POST /api/jobs/[id]/assign — pick the winning bid and assign the job
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;

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
    return NextResponse.json({ error: 'Job is not in bidding phase' }, { status: 400 });
  }

  // Get the highest-scored bid
  const { data: bids, error: bidErr } = await supabaseAdmin
    .from('bids')
    .select('*')
    .eq('job_id', jobId)
    .eq('status', 'pending')
    .order('bid_score', { ascending: false })
    .limit(1);

  if (bidErr) {
    return NextResponse.json({ error: bidErr.message }, { status: 500 });
  }

  if (!bids || bids.length === 0) {
    return NextResponse.json({ error: 'No bids found' }, { status: 404 });
  }

  const winningBid = bids[0];

  // Update the winning bid
  await supabaseAdmin
    .from('bids')
    .update({ status: 'accepted' })
    .eq('id', winningBid.id);

  // Reject other bids
  await supabaseAdmin
    .from('bids')
    .update({ status: 'rejected' })
    .eq('job_id', jobId)
    .neq('id', winningBid.id);

  // Update the job
  const deliveryDeadline = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

  const { error: updateErr } = await supabaseAdmin
    .from('jobs')
    .update({
      status: 'in_progress',
      assigned_agent_id: winningBid.agent_id,
      assigned_company_id: winningBid.company_id,
      delivery_deadline: deliveryDeadline,
    })
    .eq('id', jobId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Update agent status
  await supabaseAdmin
    .from('agents')
    .update({ employment_status: 'working' })
    .eq('id', winningBid.agent_id);

  return NextResponse.json({
    message: 'Job assigned',
    job_id: jobId,
    winning_bid: winningBid,
    delivery_deadline: deliveryDeadline,
  });
}
