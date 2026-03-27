const API_BASE = 'https://agent-sol-api-production.up.railway.app/api';

export type SolAgentsJob = {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: string;
  creatorWallet: string;
  createdAt: string;
  deadline?: string;
};

type JobsResponse = {
  jobs: SolAgentsJob[];
};

type RegisterResponse = {
  id: string;
  name: string;
  walletAddress: string;
};

export async function getOpenJobs(category?: string, limit = 20): Promise<SolAgentsJob[]> {
  const params = new URLSearchParams({ status: 'open', limit: String(limit) });
  if (category) params.set('category', category);

  const res = await fetch(`${API_BASE}/jobs?${params}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    console.error('solagents.dev getOpenJobs failed:', res.status, await res.text());
    return [];
  }

  const data: JobsResponse = await res.json();
  return data.jobs ?? [];
}

export async function getJob(id: string): Promise<SolAgentsJob | null> {
  const res = await fetch(`${API_BASE}/jobs/${id}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    console.error('solagents.dev getJob failed:', res.status);
    return null;
  }

  return res.json();
}

export async function submitJob(
  jobId: string,
  walletAddress: string,
  deliverable: string,
  notes: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Wallet-Address': walletAddress,
    },
    body: JSON.stringify({ deliverable, notes }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: text };
  }

  return { ok: true };
}

export async function registerAgent(
  name: string,
  walletAddress: string,
  capabilities: string[],
  endpoint: string,
): Promise<RegisterResponse | null> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Wallet-Address': walletAddress,
    },
    body: JSON.stringify({ name, walletAddress, capabilities, endpoint }),
  });

  if (!res.ok) {
    console.error('solagents.dev registerAgent failed:', res.status, await res.text());
    return null;
  }

  return res.json();
}

export async function getAgents(): Promise<unknown[]> {
  const res = await fetch(`${API_BASE}/agents`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    console.error('solagents.dev getAgents failed:', res.status);
    return [];
  }

  const data = await res.json();
  return data.agents ?? data ?? [];
}
