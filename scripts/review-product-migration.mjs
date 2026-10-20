import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
fs.mkdirSync('output/product-audit',{recursive:true});let s=fs.readFileSync('prisma/schema.prisma','utf8').split('// A durable outbox')[0];
s=s.replace('  careerJobs CareerJob[]\n  resumeWorkspace ResumeWorkspace?\n  careerExploration CareerExploration?','').replace('  selectedAnswers Json @default("[]")\n  progressVersion Int @default(0)\n','');fs.writeFileSync('output/product-audit/before.prisma',s);
const result=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','diff','--from-schema-datamodel','output/product-audit/before.prisma','--to-schema-datamodel','prisma/schema.prisma','--script'],{encoding:'utf8'});fs.writeFileSync('output/product-audit/schema-diff.sql',result.stdout||'');console.log('Offline schema diff exit:',result.status);if(result.status!==0)console.log('Schema diff could not be generated.');process.exitCode=result.status??1;
