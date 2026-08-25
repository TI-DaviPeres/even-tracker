import { and, asc, desc, eq, sql } from "drizzle-orm";
import { cache } from "react";

import { getDb } from "./index";
import { entries, participants, rooms } from "./schema";
import type { Tally } from "@/lib/balance";

export type HistoryItem = {
  id: number;
  participantId: number;
  name: string;
  createdAt: Date;
};

export type RoomSnapshot = {
  id: number;
  code: string;
  name: string;
  createdAt: Date;
  tallies: Tally[];
  history: HistoryItem[];
};

const HISTORY_LIMIT = 30;

/**
 * Carrega tudo que a tela da sala precisa. `null` se o código não existe.
 *
 * Memoizada por request: a página chama isto no `generateMetadata` e de novo
 * no render, e sem o cache seriam seis idas ao banco por pageview.
 */
export const getRoomByCode = cache(async function getRoomByCode(
  code: string,
): Promise<RoomSnapshot | null> {
  const [room] = await getDb()
    .select()
    .from(rooms)
    .where(eq(rooms.code, code))
    .limit(1);

  if (!room) return null;

  // Agrupar pela PK basta no Postgres: as outras colunas de `participants`
  // são funcionalmente dependentes dela.
  const [tallies, history] = await Promise.all([
    getDb()
      .select({
        id: participants.id,
        name: participants.name,
        count: sql<number>`count(${entries.id})::int`,
      })
      .from(participants)
      .leftJoin(entries, eq(entries.participantId, participants.id))
      .where(eq(participants.roomId, room.id))
      .groupBy(participants.id)
      .orderBy(desc(sql`count(${entries.id})`), asc(participants.createdAt)),
    getDb()
      .select({
        id: entries.id,
        participantId: entries.participantId,
        name: participants.name,
        createdAt: entries.createdAt,
      })
      .from(entries)
      .innerJoin(participants, eq(participants.id, entries.participantId))
      .where(eq(entries.roomId, room.id))
      .orderBy(desc(entries.createdAt), desc(entries.id))
      .limit(HISTORY_LIMIT),
  ]);

  return { ...room, tallies, history };
});

/**
 * Procura a pessoa na sala ignorando maiúsculas, para "davi" reaproveitar
 * o "Davi" que já existe em vez de criar uma segunda linha.
 */
export async function findParticipantByName(roomId: number, name: string) {
  const [found] = await getDb()
    .select()
    .from(participants)
    .where(
      and(
        eq(participants.roomId, roomId),
        sql`lower(${participants.name}) = lower(${name})`,
      ),
    )
    .limit(1);
  return found ?? null;
}

export async function participantBelongsToRoom(
  participantId: number,
  roomId: number,
): Promise<boolean> {
  const [found] = await getDb()
    .select({ id: participants.id })
    .from(participants)
    .where(and(eq(participants.id, participantId), eq(participants.roomId, roomId)))
    .limit(1);
  return Boolean(found);
}
