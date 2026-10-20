import { auth } from "@clerk/nextjs/server";
export async function GET(){const {userId}=await auth();if(!userId)return Response.json({error:"Unauthorized"},{status:401});return Response.json({ok:true,status:"active"});}
export async function POST(){return Response.json({error:"Profile updates use the authenticated workspace actions."},{status:405,headers:{Allow:"GET"}});}
