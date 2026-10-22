/** Parse database configuration without leaking credentials through URL errors. */
export function parseDatabaseUrl(value) {
  const message = "Database connection must be a PostgreSQL URL only (postgresql://...), without the psql command or shell quotes.";
  try {
    const parsed = new URL(value);
    if (!["postgresql:", "postgres:"].includes(parsed.protocol) || !parsed.hostname || parsed.pathname.length < 2) throw new Error(message);
    return parsed;
  } catch {
    throw new Error(message);
  }
}
