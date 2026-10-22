import nextEnv from '@next/env';
import { createHash } from 'node:crypto';
import { parseDatabaseUrl } from '../lib/database-url.js';
nextEnv.loadEnvConfig(process.cwd(), false);
let databaseUrl;
try { databaseUrl=parseDatabaseUrl(process.env.DATABASE_URL); }
catch(error) { console.error(error.message); process.exit(1); }
const names=['DATABASE_URL','NEXT_PUBLIC_APP_URL','INNGEST_EVENT_KEY','INNGEST_SIGNING_KEY','GEMINI_API_KEY','GEMINI_MODEL','CLERK_SECRET_KEY','VERCEL_TOKEN'];
console.log(JSON.stringify({configured:Object.fromEntries(names.map(k=>[k,!!process.env[k]])),productionAuth:process.env.CLERK_SECRET_KEY?.startsWith('sk_live_')||false,hostLinked:process.env.VERCEL_PROJECT_ID?true:false,databaseFingerprint:createHash('sha256').update(databaseUrl.hostname+databaseUrl.pathname).digest('hex').slice(0,12)},null,2));
const {PrismaClient}=await import('@prisma/client'); const db=new PrismaClient();
try{await db.$queryRaw`SELECT 1`;console.log(JSON.stringify({databaseReachable:true}));try{const migrations=await db.$queryRaw`SELECT migration_name, finished_at IS NOT NULL AS applied, rolled_back_at IS NOT NULL AS rolled_back FROM "_prisma_migrations" ORDER BY started_at`;console.log(JSON.stringify({migrationHistoryAvailable:true,migrations}));}catch(error){console.log(JSON.stringify({migrationHistoryAvailable:false,code:error.code||error.name,sqlState:error.meta?.code}));const tables=await db.$queryRaw`SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') ORDER BY table_schema, table_name`;console.log(JSON.stringify({tables}));const columns=await db.$queryRaw`SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position`;console.log(JSON.stringify({columns}));}}catch(error){console.log(JSON.stringify({databaseReachable:false,code:error.code||error.name,engineIssue:/could not locate|Unable to require|not a valid Win32|Query Engine.*not|query engine.*not/i.test(error.message),connectionIssue:/reach database|connect|timed out|refused|TLS/i.test(error.message)}));}finally{await db.$disconnect();}
