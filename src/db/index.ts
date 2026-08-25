import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

let cached: NodePgDatabase<typeof schema> | undefined;

/**
 * Conexão preguiçosa e memoizada. Criar o pool no topo do módulo faria o
 * `next build` explodir em qualquer ambiente sem DATABASE_URL, mesmo sem
 * nenhuma página consultar o banco durante o build.
 *
 * Driver TCP genérico (`pg`) em vez do driver HTTP do Neon: o mesmo código fala
 * com o Postgres do docker-compose no local e com qualquer Postgres hospedado
 * em produção. No Fluid Compute da Vercel a função fica quente o suficiente
 * para reaproveitar a conexão entre requests.
 */
export function getDb(): NodePgDatabase<typeof schema> {
  if (cached) return cached;

  const connectionString = process.env.DATABASE_URL ?? "";

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não definida. Suba o banco local com `docker compose up -d` e copie .env.example para .env.local.",
    );
  }

  // Sem opção `ssl` de propósito: no `pg`, um `sslmode` presente na connection
  // string sobrescreve silenciosamente qualquer objeto `ssl` passado aqui.
  // Deixar a string mandar faz os dois ambientes funcionarem sem condicional —
  // a do Neon vem com `sslmode=require`, a do Docker local não traz nenhum.
  const pool = new Pool({
    connectionString,
    max: 1, // uma conexão por instância de função
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  cached = drizzle(pool, { schema });
  return cached;
}

export { schema };
