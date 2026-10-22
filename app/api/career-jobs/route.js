import { auth } from '@clerk/nextjs/server';
import { listCareerJobs } from '@/actions/career-jobs';

export const dynamic='force-dynamic';
export async function GET() {
  const headers={'Cache-Control':'private, no-store'};
  const {userId}=await auth();
  if(!userId)return Response.json({error:'Unauthorized'},{status:401,headers});
  try{return Response.json(await listCareerJobs(),{headers});}
  catch{return Response.json({error:'Task status unavailable'},{status:503,headers});}
}
