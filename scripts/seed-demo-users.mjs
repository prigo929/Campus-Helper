import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const demos = [
  {
    email: 'jordan@campushelper.test',
    password: 'CampusDemo1!',
    full_name: 'Jordan Kim',
    university: 'State University',
    major: 'Computer Science',
    year: 'Junior',
    bio: 'Demo account for testing jobs flow.',
  },
  {
    email: 'maya@campushelper.test',
    password: 'CampusDemo2!',
    full_name: 'Maya Patel',
    university: 'Coastal College',
    major: 'Marketing',
    year: 'Senior',
    bio: 'Demo account for testing marketplace flow.',
  },
  {
    email: 'liam@campushelper.test',
    password: 'CampusDemo3!',
    full_name: 'Liam Chen',
    university: 'Metro University',
    major: 'Economics',
    year: 'Sophomore',
    bio: 'Demo account for testing forum flow.',
  },
];

for (const demo of demos) {
  const { data: user, error: createErr } = await supabase.auth.admin.createUser({
    email: demo.email,
    password: demo.password,
    email_confirm: true,
    user_metadata: {
      full_name: demo.full_name,
      university: demo.university,
      major: demo.major,
      year: demo.year,
    },
  });

  if (createErr) {
    console.error(`Failed to create ${demo.email}: ${createErr.message}`);
    continue;
  }

  const userId = user.user?.id;
  if (!userId) {
    console.error(`No user id for ${demo.email}`);
    continue;
  }

  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: userId,
    email: demo.email,
    full_name: demo.full_name,
    university: demo.university,
    major: demo.major,
    year: demo.year,
    bio: demo.bio,
  });

  if (profileErr) {
    console.error(`Profile upsert failed for ${demo.email}: ${profileErr.message}`);
  } else {
    console.log(`Seeded ${demo.email}`);
  }
}

console.log('Done.');
