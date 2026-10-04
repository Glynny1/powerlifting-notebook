// Runs every .sql file in db/sql (in name order) against the database.
// For functions and triggers that Drizzle doesn't manage. Each file must be
// safe to re-run.
//   npm run db:sql
import { existsSync, readdirSync, readFileSync } from "node:fs";
import postgres from "postgres";

async function main() {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set in .env.local");

  // Session pooler: multi-statement scripts don't belong on the transaction pooler
  const client = postgres(url.replace(/:6543\//, ":5432/"), {
    max: 1,
    onnotice: () => {}, // "already exists, skipping" notices on re-runs
  });
  try {
    const dir = "db/sql";
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
      await client.begin((tx) => tx.unsafe(readFileSync(`${dir}/${file}`, "utf8")));
      console.log(`Applied ${file}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
