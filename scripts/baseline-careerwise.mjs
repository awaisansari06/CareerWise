import nextEnv from '@next/env';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
nextEnv.loadEnvConfig(process.cwd(),false);
const target=new URL(process.env.DATABASE_URL);
const fingerprint=createHash('sha256').update(target.hostname+target.pathname).digest('hex').slice(0,12);
if(process.argv[2]!=='--apply-reviewed-baseline'||fingerprint!=='754cdee36d8c')throw new Error('This one-time baseline is restricted to the reviewed database.');
const {PrismaClient}=await import('@prisma/client');
const runtime=new URL(process.env.DATABASE_URL);runtime.searchParams.set('connect_timeout','20');
const db=new PrismaClient({datasourceUrl:runtime.toString()});
const direct=new URL(process.env.DATABASE_URL);direct.hostname=direct.hostname.replace('-pooler.','.');direct.searchParams.set('connect_timeout','15');
const migrationEnv={...process.env,DATABASE_URL:direct.toString()};
function prisma(args){const r=spawnSync(process.execPath,['node_modules/prisma/build/index.js',...args],{encoding:'utf8',env:migrationEnv,timeout:180000});if(r.status!==0){const code=(r.stderr||r.stdout||'').match(/P\d{4}/)?.[0]||'unknown';console.error((r.stderr||r.stdout||r.error?.message||'').replace(/postgres(?:ql)?:\/\/[^\s"']+/gi,'[connection redacted]').slice(-1800));throw new Error(`Prisma ${args.slice(0,2).join(' ')} failed (${code}); inspect securely before retrying.`);}return r.stdout;}
try{
 const history=await db.$queryRaw`SELECT to_regclass('public._prisma_migrations')::text AS name`;
 const recorded=history[0].name?await db.$queryRaw`SELECT migration_name,checksum,finished_at,rolled_back_at FROM "_prisma_migrations"`:[];
 for(const row of recorded){const path=`prisma/migrations/${row.migration_name}/migration.sql`;if(row.migration_name>='20261020000100_durable_career_workflows'||!fs.existsSync(path)||!row.finished_at||row.rolled_back_at||createHash('sha256').update(fs.readFileSync(path)).digest('hex')!==row.checksum)throw new Error('Migration history requires manual review; no automatic baseline permitted.');}
 const diff=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','diff','--from-schema-datasource','prisma/schema.prisma','--to-schema-datamodel','output/product-audit/before.prisma','--script','--exit-code'],{encoding:'utf8',env:migrationEnv});
 if(diff.status!==0)throw new Error('Existing schema differs from reviewed baseline. No history recorded.');
 const tables=['User','Resume','ResumeAnalysis','Assessment','CoverLetter','Roadmap','IndustryInsight','AiUsage'];
 const counts=async()=>Object.fromEntries(await Promise.all(tables.map(async table=>[table,Number((await db.$queryRawUnsafe(`SELECT count(*) AS count FROM "${table}"`))[0].count)])));
 const before=await counts();
 const migrations=fs.readdirSync('prisma/migrations',{withFileTypes:true}).filter(x=>x.isDirectory()&&x.name<'20261020000100_durable_career_workflows').map(x=>x.name).sort();
 for(const name of migrations){if(recorded.some(row=>row.migration_name===name))continue;prisma(['migrate','resolve','--applied',name]);console.log(`Recorded existing migration: ${name}`);}
 prisma(['migrate','deploy']);
 const after=await counts();
 const unchanged=JSON.stringify(before)===JSON.stringify(after);
 console.log(JSON.stringify({migrationApplied:'20261020000100_durable_career_workflows',existingRowCountsUnchanged:unchanged}));
 fs.writeFileSync('output/product-audit/database-release.json',JSON.stringify({fingerprint,appliedAt:new Date().toISOString(),baselined:migrations,migrationApplied:'20261020000100_durable_career_workflows',existingRowCountsUnchanged:unchanged},null,2));
 if(!unchanged)throw new Error('Row counts changed during release; inspect concurrent activity.');
 prisma(['migrate','status']);console.log('Prisma migration history is up to date.');
}catch(error){console.error(error.code?`Database operation failed (${error.code}); inspect securely before retrying.`:error.message);process.exitCode=1;}finally{await db.$disconnect();}
