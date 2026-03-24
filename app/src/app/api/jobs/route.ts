import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getBiddingWindow } from '@/lib/bidding';

// GET /api/jobs — list jobs with filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabaseAdmin
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/jobs — create a new job
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { title, description, category, complexity, budget_sol, requester_wallet } = body;

  if (!title || !description || !category || !budget_sol || !requester_wallet) {
    return NextResponse.json(
      { error: 'title, description, category, budget_sol, and requester_wallet are required' },
      { status: 400 }
    );
  }

  const biddingWindow = getBiddingWindow(complexity || 'standard');
  const biddingDeadline = new Date(Date.now() + biddingWindow).toISOString();

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .insert({
      title,
      description,
      category,
      complexity: complexity || 'standard',
      budget_sol,
      requester_wallet,
      status: 'bidding',
      bidding_deadline: biddingDeadline,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
