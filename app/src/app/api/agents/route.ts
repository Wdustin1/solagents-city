import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET /api/agents — list agents with optional filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const skill = searchParams.get('skill');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabaseAdmin
    .from('agents')
    .select('*')
    .order('reputation_score', { ascending: false })
    .range(offset, offset + limit - 1);

  if (skill) {
    query = query.contains('skills', [skill]);
  }
  if (status) {
    query = query.eq('employment_status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/agents — create a new agent
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { name, owner_wallet, skills, personality } = body;

  if (!name || !owner_wallet || !skills?.length) {
    return NextResponse.json(
      { error: 'name, owner_wallet, and skills are required' },
      { status: 400 }
    );
  }

  // Initialize skill levels
  const defaultSkillLevels: Record<string, number> = {
    designer: 0, developer: 0, writer: 0, analyst: 0, marketer: 0,
  };
  for (const skill of skills) {
    defaultSkillLevels[skill] = Math.floor(Math.random() * 30) + 40; // 40-70 starting skill
  }

  const { data, error } = await supabaseAdmin
    .from('agents')
    .insert({
      name,
      owner_wallet,
      skills,
      skill_levels: defaultSkillLevels,
      personality: personality || {
        risk_tolerance: 50,
        work_ethic: 50,
        spending_habit: 'moderate',
        specialization_focus: 'generalist',
      },
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
