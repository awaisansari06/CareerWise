import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd(), false);

const { db } = await import('../lib/prisma.js');

async function main() {
  console.log('Querying existing database tables...');
  const tables = await db.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('Existing tables in public schema:', tables.map(t => t.table_name));

  const hasAiUsage = tables.some(t => t.table_name.toLowerCase() === 'aiusage');

  if (!hasAiUsage) {
    console.log('Creating AiUsage table...');
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AiUsage" (
        "id" TEXT NOT NULL,
        "count" INTEGER NOT NULL DEFAULT 1,
        "windowStart" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('Creating index AiUsage_windowStart_idx...');
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "AiUsage_windowStart_idx" ON "AiUsage"("windowStart");
    `);
    console.log('AiUsage table and index created successfully!');
  } else {
    console.log('AiUsage table already exists.');
  }

  // Also check if _prisma_migrations table exists and if 20261014000100_ai_usage_budget is recorded
  const hasMigrationsTable = tables.some(t => t.table_name === '_prisma_migrations');
  if (hasMigrationsTable) {
    const migration = await db.$queryRawUnsafe(`
      SELECT migration_name FROM "_prisma_migrations" WHERE migration_name LIKE '%ai_usage_budget%';
    `);
    console.log('Migration record in _prisma_migrations:', migration);
    if (migration.length === 0) {
      console.log('Recording migration in _prisma_migrations...');
      await db.$executeRawUnsafe(`
        INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
        VALUES (
          gen_random_uuid()::text,
          'manual_sync',
          NOW(),
          '20261014000100_ai_usage_budget',
          NULL,
          NULL,
          NOW(),
          1
        ) ON CONFLICT DO NOTHING;
      `);
      console.log('Migration recorded.');
    }
  }

  // Verify by doing an upsert test
  console.log('Verifying aiUsage upsert...');
  const testWindow = new Date(Math.floor(Date.now() / 3600000) * 3600000);
  const testId = `test-verify:${testWindow.toISOString()}`;
  const record = await db.aiUsage.upsert({
    where: { id: testId },
    create: { id: testId, windowStart: testWindow, count: 1 },
    update: { count: { increment: 1 } },
  });
  console.log('AiUsage upsert test successful! Record:', record);

  // Clean up test record
  await db.aiUsage.delete({ where: { id: testId } });
  console.log('Test record cleaned up.');
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
