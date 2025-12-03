import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const MAX_RESULTS = 8;
const FALLBACK_RESULTS = {
  jobs: [
    {
      id: 'demo-job-1',
      title: 'Library Desk Assistant',
      description: 'Evening shift helping students check out books and equipment.',
      location: 'On campus',
      pay_rate: 17,
      pay_type: 'hourly',
    },
    {
      id: 'demo-job-2',
      title: 'Peer Tutor - Calculus',
      description: 'Work 4–6 hrs/week tutoring Calc I & II students.',
      location: 'Hybrid',
      pay_rate: 22,
      pay_type: 'hourly',
    },
  ],
  items: [
    {
      id: 'demo-item-1',
      title: 'MacBook Air M1 8GB/256GB',
      description: 'Lightly used, includes charger.',
      price: 625,
      condition: 'good',
      category: 'equipment',
    },
    {
      id: 'demo-item-2',
      title: 'Organic Chemistry Notes + Flashcards',
      description: 'Full semester set with practice questions.',
      price: 35,
      condition: 'like_new',
      category: 'notes',
    },
  ],
  posts: [
    {
      id: 'demo-post-1',
      title: 'Best places to study late?',
      content: 'Looking for quiet spots open after 10pm.',
      category: 'general',
    },
    {
      id: 'demo-post-2',
      title: 'Anyone selling a lab coat (size M)?',
      content: 'Need one for CHEM 201 next week.',
      category: 'academic',
    },
  ],
};

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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const client = getClient();
  if (!client) {
    console.warn('Supabase not configured; returning empty search results.');
    return NextResponse.json(FALLBACK_RESULTS);
  }

  const pattern = `%${q}%`;

  try {
    const [jobsRes, itemsRes, postsRes] = await Promise.all([
      client
        .from('jobs')
        .select('id, title, description, location, pay_rate, pay_type')
        .or(`title.ilike.${pattern},description.ilike.${pattern},location.ilike.${pattern}`)
        .order('created_at', { ascending: false })
        .limit(MAX_RESULTS),
      client
        .from('marketplace_items')
        .select('id, title, description, price, condition, category')
        .or(`title.ilike.${pattern},description.ilike.${pattern}`)
        .order('created_at', { ascending: false })
        .limit(MAX_RESULTS),
      client
        .from('forum_posts')
        .select('id, title, content, category')
        .or(`title.ilike.${pattern},content.ilike.${pattern}`)
        .order('created_at', { ascending: false })
        .limit(MAX_RESULTS),
    ]);

    if (jobsRes.error || itemsRes.error || postsRes.error) {
      console.error('Search error', { jobs: jobsRes.error, items: itemsRes.error, posts: postsRes.error });
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    const payload = {
      jobs: jobsRes.data || [],
      items: itemsRes.data || [],
      posts: postsRes.data || [],
    };

    if (!payload.jobs.length && !payload.items.length && !payload.posts.length) {
      return NextResponse.json(FALLBACK_RESULTS);
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Search exception', error);
    return NextResponse.json(FALLBACK_RESULTS);
  }
}
