// Use reviewed, committed migrations; never fabricate Prisma migration history.
import { spawnSync } from 'node:child_process';
console.log('Applying committed Prisma migrations with migrate deploy. No reset or seed.');
const result=spawnSync(process.execPath,['scripts/migrate-production.mjs','deploy'],{stdio:'inherit'});
process.exitCode=result.status??1;
