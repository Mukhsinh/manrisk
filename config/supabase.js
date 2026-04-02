const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Missing Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)';
  logger.error(errorMsg);
  
  // Jangan throw error di serverless, biarkan app tetap jalan dengan fallback
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    throw new Error(errorMsg);
  }
}

// Client for client-side operations (uses anon key)
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

// Admin client for server-side operations (uses service role key)
const supabaseAdmin = supabaseServiceKey && supabaseUrl
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

if (supabase) {
  logger.info('Supabase client initialized');
}

if (supabaseAdmin) {
  logger.info('Supabase admin client initialized');
}

function getSupabaseClientForRequest(req) {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const authHeader = req?.headers?.authorization || req?.headers?.Authorization || '';
  if (!authHeader?.startsWith('Bearer ') || !supabaseUrl || !supabaseAnonKey) {
    return supabase;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function createQueryBuilderMock() {
  const buildResponse = async () => ({ data: null, error: null });
  const builder = {
    eq: () => builder,
    neq: () => builder,
    gt: () => builder,
    gte: () => builder,
    lt: () => builder,
    lte: () => builder,
    like: () => builder,
    ilike: () => builder,
    in: () => builder,
    order: () => builder,
    limit: () => builder,
    range: () => builder,
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    upsert: () => builder,
    single: buildResponse,
    maybeSingle: buildResponse,
    is: () => builder,
    not: () => builder,
    contains: () => builder,
    count: () => ({ data: null, error: null }),
    then: (resolve) => resolve({ data: null, error: null })
  };
  return builder;
}

module.exports = {
  supabase: supabase || {
    auth: {
      signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: null }, error: null })
    },
    from: () => createQueryBuilderMock()
  },
  supabaseAdmin,
  getSupabaseClientForRequest
};

