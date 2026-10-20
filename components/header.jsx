import { checkUser } from "@/lib/checkUser";
import SiteNavigation from "@/components/site-navigation";

export default async function Header() {
  const user = await checkUser();
  return <SiteNavigation initialSignedIn={!!user}/>;
}
