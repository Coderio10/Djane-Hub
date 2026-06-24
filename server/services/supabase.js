// server/services/supabase.js
import { createClient } from '@supabase/supabase-js'
import WebSocket from 'ws'

// process.env reads from your .env file (loaded by dotenv in index.js)
// If either value is missing, throw immediately — better to crash early
// than silently fail later with a confusing error
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables'
  )
}

// createClient initialises the Supabase connection
// The service key gives full access — only use it on the backend
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    realtime: {
      transport: WebSocket,
    },
  }
)

export default supabase
