import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

let cached: NeonHttpDatabase<typeof schema> | undefined;

/**
 * Conexão preguiçosa e memoizada. Criar o cliente no topo do módulo faria o
 * `next build` explodir em qualquer ambiente sem DATABASE_URL, mesmo sem
 * nenhuma página consultar o banco durante o build.
 */
export function getDb(): NeonHttpDatabase<typeof schema> {
  if (cached) return cached;

  const connectionString =
    process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não definida. Rode `npx vercel env pull .env.local` ou copie .env.example para .env.local.",
    );
  }

  cached = drizzle(neon(connectionString), { schema });
  return cached;
}

export { schema };
