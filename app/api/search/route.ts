import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const MAX_RESULTS = 8;
const EMPTY_RESULTS = { jobs: [], items: [], posts: [] };

// Use Node runtime so the service-role key works and avoid edge limitations.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getClient() {
  // Prefer service role for broader access; fall back to anon client if missing.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return supabase;
}

function buildOrFilter(query: string, fields: string[]) {
  const terms = Array.from(
    new Set(
      query
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean)
    )
  );

  // Always include the full query as a fuzzy match plus each term for partial matches.
  const patterns = new Set<string>([`%${query}%`]);
  terms.forEach((term) => patterns.add(`%${term}%`));

  const clauses: string[] = [];
  patterns.forEach((pattern) => {
    fields.forEach((field) => clauses.push(`${field}.ilike.${pattern}`));
  });

  return clauses.join(',');
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const client = getClient();
  if (!client) {
    console.warn('Supabase not configured; returning empty search results.');
    return NextResponse.json(EMPTY_RESULTS);
  }

  const jobsFilter = buildOrFilter(q, ['title', 'description', 'location', 'category']);
  const itemsFilter = buildOrFilter(q, ['title', 'description', 'category', 'condition']);
  const postsFilter = buildOrFilter(q, ['title', 'content', 'category']);

  try {
    const [jobsRes, itemsRes, postsRes] = await Promise.all([
      client
        .from('jobs')
        .select('id, title, description, location, pay_rate, pay_type, category, updated_at, created_at')
        .or(jobsFilter)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(MAX_RESULTS),
      client
        .from('marketplace_items')
        .select('id, title, description, price, condition, category, updated_at, created_at')
        .or(itemsFilter)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(MAX_RESULTS),
      client
        .from('forum_posts')
        .select('id, title, content, category, updated_at, created_at')
        .or(postsFilter)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(MAX_RESULTS),
    ]);

    if (jobsRes.error || itemsRes.error || postsRes.error) {
      console.error('Search error', { jobs: jobsRes.error, items: itemsRes.error, posts: postsRes.error });
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json({
      jobs: jobsRes.data || [],
      items: itemsRes.data || [],
      posts: postsRes.data || [],
    });
  } catch (error) {
    console.error('Search exception', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
