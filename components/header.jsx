import { auth } from "@clerk/nextjs/server";
import { unstable_rethrow } from "next/navigation";
import SiteNavigation from "@/components/site-navigation";

export default async function Header() {
  // The navigation shell must never wait for the database or remote user profile.
  let signedIn=false;
  try { signedIn=!!(await auth()).userId; }
  catch(error){
    unstable_rethrow(error);
    // Static 404/asset requests can intentionally bypass Clerk middleware.
    if(!error?.message?.includes('clerkMiddleware'))throw error;
  }
  return <SiteNavigation initialSignedIn={signedIn}/>;
}
