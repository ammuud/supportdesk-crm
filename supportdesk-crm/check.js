require('dotenv').config();

async function inspectSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Missing credentials');
    process.exit(1);
  }

  try {
    const res = await fetch(`${url}/rest/v1/tickets?limit=1`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Tickets table data sample:', JSON.stringify(data, null, 2));
    } else {
      console.error('Error fetching tickets:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

inspectSupabase();
