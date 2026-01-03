import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const MAX_RESULTS = 10;
const MAX_FETCH = 40;
const EMPTY_RESULTS = { jobs: [], items: [], posts: [] };

// Use Node runtime so we can use Supabase client properly, but we removed service key usage.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getClient(authHeader?: string): {
  client: SupabaseClient | null;
} {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  // We explicitly IGNORE the service role key here to ensure RLS is always respected.
  // Public search should only return what is visible to the anonymous user (or the authenticated user if token provided).

  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    '';

  const headers = authHeader ? { Authorization: authHeader } : undefined;

  if (supabaseUrl && anonKey) {
    return {
      client: createClient(supabaseUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: headers ? { headers } : undefined,
      }),
    };
  }
  return { client: supabase };
}

function tokenize(query: string) {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/\s+/)
        .map((part) => part.trim())
        .filter((part) => part.length > 1)
    )
  );
}

function buildOrFilter(query: string, fields: string[]) {
  const terms = tokenize(query);
  const patterns = new Set<string>([`%${query}%`]);
  terms.forEach((term) => {
    patterns.add(`%${term}%`);
    patterns.add(`${term}%`);
  });

  const clauses: string[] = [];
  patterns.forEach((pattern) => {
    fields.forEach((field) => clauses.push(`${field}.ilike.${pattern}`));
  });

  return clauses.join(',');
}

function scoreRecord(
  record: Record<string, any>,
  query: string,
  priorityFields: string[],
  secondaryFields: string[]
) {
  const full = query.toLowerCase();
  const terms = tokenize(query);
  let score = 0;

  const recencySource = record.updated_at || record.created_at;
  if (recencySource) {
    const ageDays = (Date.now() - new Date(recencySource).getTime()) / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0.6, 1.6 - ageDays / 60);
    score += recencyBoost;
  }

  const checkFields = (fields: string[], weight: number) => {
    fields.forEach((field) => {
      const raw = (record[field] || '').toString().toLowerCase();
      if (!raw) return;
      if (raw.includes(full)) {
        score += weight * 4;
      }
      terms.forEach((term) => {
        if (raw.startsWith(term)) score += weight * 2.5;
        else if (raw.includes(term)) score += weight * 1.5;
      });
    });
  };

  checkFields(priorityFields, 2.5);
  checkFields(secondaryFields, 1);

  return score;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const authHeader = request.headers.get('authorization') || undefined;
  const { client } = getClient(authHeader);
  if (!client) {
    console.warn('Supabase not configured; cannot search.');
    return NextResponse.json({ error: 'Search unavailable' }, { status: 500 });
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
        .limit(MAX_FETCH),
      client
        .from('marketplace_items')
        .select('id, title, description, price, condition, category, updated_at, created_at')
        .or(itemsFilter)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(MAX_FETCH),
      client
        .from('forum_posts')
        .select('id, title, content, category, updated_at, created_at')
        .or(postsFilter)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(MAX_FETCH),
    ]);

    if (jobsRes.error || itemsRes.error || postsRes.error) {
      console.error('Search error', { jobs: jobsRes.error, items: itemsRes.error, posts: postsRes.error });
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    const rankedJobs =
      (jobsRes.data || [])
        .map((job) => ({
          ...job,
          _score: scoreRecord(job, q, ['title', 'location', 'category'], ['description']),
        }))
        .sort((a, b) => b._score - a._score)
        .slice(0, MAX_RESULTS);

    const rankedItems =
      (itemsRes.data || [])
        .map((item) => ({
          ...item,
          _score: scoreRecord(item, q, ['title', 'category'], ['description', 'condition']),
        }))
        .sort((a, b) => b._score - a._score)
        .slice(0, MAX_RESULTS);

    const rankedPosts =
      (postsRes.data || [])
        .map((post) => ({
          ...post,
          _score: scoreRecord(post, q, ['title', 'category'], ['content']),
        }))
        .sort((a, b) => b._score - a._score)
        .slice(0, MAX_RESULTS);

    const meta = {
      counts: {
        jobs: rankedJobs.length,
        items: rankedItems.length,
        posts: rankedPosts.length,
      },
    };

    return NextResponse.json({
      jobs: rankedJobs,
      items: rankedItems,
      posts: rankedPosts,
      meta,
    });
  } catch (error) {
    console.error('Search exception', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
