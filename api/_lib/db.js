import { neon } from '@neondatabase/serverless';

// Uses the same POSTGRES_URL env var that Vercel's Neon integration provisions,
// so no new environment variables need to be configured.
const sql = neon(process.env.POSTGRES_URL);

export default sql;
