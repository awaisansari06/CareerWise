import nextEnv from '@next/env';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
nextEnv.loadEnvConfig(process.cwd(), false);
// Credentials remain in the child environment, never in arguments or output.
const result=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','diff','--from-schema-datasource','prisma/schema.prisma','--to-schema-datamodel','output/product-audit/before.prisma','--script','--exit-code'],{encoding:'utf8',env:process.env});
fs.writeFileSync('output/product-audit/live-baseline-diff.sql',result.stdout||'');
console.log(JSON.stringify({baselineMatches:result.status===0,exitCode:result.status}));
if(result.status===2)console.log(result.stdout);
if(result.status!==0&&result.status!==2)console.log('Live comparison failed; no database changes were made.');
process.exitCode=result.status??1;
