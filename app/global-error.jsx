"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="en"><body style={{ fontFamily: "Arial, sans-serif", padding: "64px 24px", textAlign: "center" }}>
      <h1>CareerWise is temporarily unavailable</h1>
      <p>Please try again in a moment.</p>
      <button onClick={reset} style={{ padding: "12px 24px", cursor: "pointer" }}>Try again</button>
    </body></html>
  );
}
