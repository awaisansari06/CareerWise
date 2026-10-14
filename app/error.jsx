"use client";

import Link from 'next/link';

export default function ErrorPage({ reset }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-6 pt-24 text-center">
      <h1 className="text-2xl font-bold">We couldn&apos;t load this page</h1>
      <p className="text-muted-foreground">Please try again. If the problem continues, come back in a few minutes.</p>
      <button onClick={reset} className="rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground">Try again</button>
      <Link href="/" className="text-sm underline underline-offset-4">Return to CareerWise</Link>
    </div>
  );
}
