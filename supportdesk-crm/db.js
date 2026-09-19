// db.js
// Initializes the Supabase client using the environment variables.
// Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
}

// Create a single supabase client for interacting with your database
const db = createClient(supabaseUrl, supabaseKey);

module.exports = db;
