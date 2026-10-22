import nextEnv from '@next/env';
import {spawnSync} from 'node:child_process';
import {parseDatabaseUrl} from '../lib/database-url.js';
nextEnv.loadEnvConfig(process.cwd(),false);
const operation=process.argv[2]||'deploy';
if(!['deploy','status'].includes(operation))throw new Error('Only production deploy and read-only status are supported.');
let url;
try { url=parseDatabaseUrl(process.env.DIRECT_URL||process.env.DATABASE_URL); }
catch(error) { console.error(error.message); process.exit(1); }
// Neon session-level migration locks require a direct endpoint, not PgBouncer.
if(url.hostname.endsWith('.neon.tech'))url.hostname=url.hostname.replace('-pooler.','.');
url.searchParams.set('connect_timeout','15');
const result=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate',operation],{env:{...process.env,DATABASE_URL:url.toString()},encoding:'utf8',timeout:180000});
const safe=value=>(value||'').replace(/postgres(?:ql)?:\/\/[^\s"']+/gi,'[database connection redacted]');
process.stdout.write(safe(result.stdout));process.stderr.write(safe(result.stderr));
if(result.error)console.error('Migration command could not complete. Inspect status before retrying.');
process.exitCode=result.status??1;
