"use server";

import { and, desc, eq } from "drizzle-orm";
// refresh() (Next 16) atualiza o router do cliente a partir da Server Action.
// É o certo aqui: a página da sala é dinâmica (lê cookies), então não existe
// cache de rota para o revalidatePath invalidar.
import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import { findParticipantByName, participantBelongsToRoom } from "@/db/queries";
import { entries, participants, rooms } from "@/db/schema";
import { generateRoomCode, isValidRoomCode, normalizeRoomCode } from "@/lib/code";
import { clearIdentity, setIdentity } from "@/lib/identity";
import {
  normalizeName,
  validatePersonName,
  validateRoomName,
} from "@/lib/validation";

export type ActionState = { error: string | null };

const CODE_RETRIES = 5;

/** unique_violation do Postgres. */
function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === "23505";
}

async function findRoom(code: string) {
  const [room] = await getDb()
    .select()
    .from(rooms)
    .where(eq(rooms.code, code))
    .limit(1);
  return room ?? null;
}

/**
 * Cria a sala já com o criador dentro: pedir o tema e o nome na mesma tela
 * economiza um passo e a pessoa cai na sala pronta para registrar.
 */
export async function createRoom(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const roomName = normalizeName(String(formData.get("roomName") ?? ""));
  const personName = normalizeName(String(formData.get("personName") ?? ""));

  const roomError = validateRoomName(roomName);
  if (roomError) return { error: roomError };
  const personError = validatePersonName(personName);
  if (personError) return { error: personError };

  let created: { code: string; id: number } | null = null;

  // O retry cobre só a inserção da sala: é o único ponto onde a colisão de
  // código sorteado pode acontecer.
  for (let attempt = 0; attempt < CODE_RETRIES; attempt += 1) {
    try {
      const [room] = await getDb()
        .insert(rooms)
        .values({ code: generateRoomCode(), name: roomName })
        .returning();
      created = { code: room.code, id: room.id };
      break;
    } catch (error) {
      if (isUniqueViolation(error)) continue;
      console.error("createRoom: falha ao criar a sala", error);
      return { error: "Não foi possível criar a sala. Tente de novo." };
    }
  }

  if (!created) {
    return { error: "Não foi possível gerar um código. Tente de novo." };
  }

  try {
    const [creator] = await getDb()
      .insert(participants)
      .values({ roomId: created.id, name: personName })
      .returning();
    await setIdentity(created.code, creator.id);
  } catch (error) {
    console.error("createRoom: falha ao entrar na sala criada", error);
    return { error: "A sala foi criada, mas não consegui te colocar nela." };
  }

  // redirect() lança por design — precisa ficar fora do try/catch acima.
  redirect(`/sala/${created.code}`);
}

/** Entrar numa sala existente pelo código, a partir da home. */
export async function enterRoom(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = normalizeRoomCode(String(formData.get("code") ?? ""));

  if (!isValidRoomCode(code)) {
    return { error: "O código tem 6 caracteres. Confira com quem te chamou." };
  }
  if (!(await findRoom(code))) {
    return { error: `Não achei nenhuma sala com o código ${code}.` };
  }

  redirect(`/sala/${code}`);
}

/** Assumir uma identidade na sala: escolher alguém da lista ou entrar com um nome novo. */
export async function joinRoom(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = normalizeRoomCode(String(formData.get("code") ?? ""));
  const room = await findRoom(code);
  if (!room) return { error: "Sala não encontrada." };

  const existingId = Number.parseInt(String(formData.get("participantId") ?? ""), 10);

  if (Number.isInteger(existingId) && existingId > 0) {
    if (!(await participantBelongsToRoom(existingId, room.id))) {
      return { error: "Essa pessoa não está nesta sala." };
    }
    await setIdentity(code, existingId);
    refresh();
    return { error: null };
  }

  const name = normalizeName(String(formData.get("personName") ?? ""));
  const nameError = validatePersonName(name);
  if (nameError) return { error: nameError };

  // Reaproveita quem já existe (ignorando maiúsculas) antes de criar outra linha.
  const already = await findParticipantByName(room.id, name);
  if (already) {
    await setIdentity(code, already.id);
    refresh();
    return { error: null };
  }

  try {
    const [created] = await getDb()
      .insert(participants)
      .values({ roomId: room.id, name })
      .returning();
    await setIdentity(code, created.id);
  } catch (error) {
    if (isUniqueViolation(error)) {
      const raced = await findParticipantByName(room.id, name);
      if (raced) {
        await setIdentity(code, raced.id);
        refresh();
        return { error: null };
      }
    }
    console.error("joinRoom falhou", error);
    return { error: "Não foi possível entrar. Tente de novo." };
  }

  refresh();
  return { error: null };
}

/**
 * +1 em qualquer pessoa da sala: na prática quem está com o celular na mão
 * registra pelo grupo. O código da sala é o portão de escrita.
 */
export async function addEntry(formData: FormData): Promise<void> {
  const code = normalizeRoomCode(String(formData.get("code") ?? ""));
  const room = await findRoom(code);
  if (!room) return;

  const target = Number.parseInt(String(formData.get("participantId") ?? ""), 10);
  if (!Number.isInteger(target) || target <= 0) return;
  if (!(await participantBelongsToRoom(target, room.id))) return;

  await getDb().insert(entries).values({ roomId: room.id, participantId: target });
  refresh();
}

/** Desfaz a última entrada da pessoa — simétrico ao +1, para corrigir toque errado. */
export async function removeLastEntry(formData: FormData): Promise<void> {
  const code = normalizeRoomCode(String(formData.get("code") ?? ""));
  const room = await findRoom(code);
  if (!room) return;

  const target = Number.parseInt(String(formData.get("participantId") ?? ""), 10);
  if (!Number.isInteger(target) || target <= 0) return;

  const [last] = await getDb()
    .select({ id: entries.id })
    .from(entries)
    .where(and(eq(entries.roomId, room.id), eq(entries.participantId, target)))
    .orderBy(desc(entries.createdAt), desc(entries.id))
    .limit(1);

  if (!last) return;

  await getDb().delete(entries).where(eq(entries.id, last.id));
  refresh();
}

/** "Não sou eu": esquece a identidade e volta para a pergunta "Quem é você?". */
export async function switchIdentity(formData: FormData): Promise<void> {
  const code = normalizeRoomCode(String(formData.get("code") ?? ""));
  await clearIdentity(code);
  refresh();
}
