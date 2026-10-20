/** Generate into an unlocked staging directory on Windows, preserving identical loaded engines. */
import { spawnSync } from 'node:child_process';
import { readFile,writeFile,mkdir,readdir,copyFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
const cli=path.resolve('node_modules/prisma/build/index.js');
if(process.platform!=='win32'){const r=spawnSync(process.execPath,[cli,'generate'],{stdio:'inherit'});process.exit(r.status??1);}
const source=await readFile('prisma/schema.prisma','utf8');
const staging=path.resolve('node_modules/.cache/careerwise-prisma-client');
const schemaDir=path.resolve('node_modules/.cache/careerwise-prisma-schema');await mkdir(schemaDir,{recursive:true});
const schema=source.replace(/(generator client\s*\{)/,'$1\n  output = '+JSON.stringify(staging.replaceAll('\\','/')));
await writeFile(path.join(schemaDir,'schema.prisma'),schema);
const result=spawnSync(process.execPath,[cli,'generate','--schema',path.join(schemaDir,'schema.prisma')],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status??1);
const destination=path.resolve('node_modules/.prisma/client');await mkdir(destination,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const entry of await readdir(staging)){if(!entry.endsWith('.dll.node'))continue;const src=path.join(staging,entry),dest=path.join(destination,entry);const next=await readFile(src);let old;try{old=await readFile(dest);}catch{}if(!old||hash(old)!==hash(next)){try{await copyFile(src,dest);}catch{throw new Error('The Prisma engine changed and is locked. Stop app processes, then run npm run db:generate again. No generated JavaScript was replaced.');}}}
async function install(from,to){for(const entry of await readdir(from,{withFileTypes:true})){const src=path.join(from,entry.name),dest=path.join(to,entry.name);if(entry.isDirectory()){await mkdir(dest,{recursive:true});await install(src,dest);continue;}const next=await readFile(src);let old;try{old=await readFile(dest);}catch{}if(old&&hash(old)===hash(next))continue;try{await copyFile(src,dest);}catch(error){if(entry.name.endsWith('.dll.node'))throw new Error('The Prisma engine version changed. Stop the app server and run npm run db:generate again.');throw error;}}}
await install(staging,destination);console.log('Prisma client generated. Identical loaded engine files were kept in place.');
