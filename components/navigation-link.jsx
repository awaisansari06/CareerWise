"use client";
import Link, { useLinkStatus } from 'next/link';

function PendingNavigation() {
  const {pending}=useLinkStatus();
  return <><span className="cw-navigation-progress" data-pending={pending} aria-hidden="true"/>{pending && <span className="sr-only" role="status">Opening page…</span>}</>;
}

/** Keep native Link behavior, including keyboard access, prefetching and modified clicks. */
export default function NavigationLink({children,...props}) {
  return <Link {...props}>{children}<PendingNavigation/></Link>;
}
