import { NextRequest, NextResponse } from 'next/server';
import { getOpenJobs, type SolAgentsJob } from '@/lib/solagents-api';

export const revalidate = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category') ?? undefined;
  const limit = Number(searchParams.get('limit') ?? 20);

  let jobs: SolAgentsJob[] = [];
  let source: 'solagents' | 'local' | 'merged' = 'local';

  try {
    jobs = await getOpenJobs(category, limit);
    source = jobs.length > 0 ? 'solagents' : 'local';
  } catch (err) {
    console.error('Failed to fetch solagents.dev jobs:', err);
    source = 'local';
  }

  return NextResponse.json({ jobs, source });
}
