import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { switchIdentity } from "@/app/actions";
import { BalanceBanner } from "@/components/BalanceBanner";
import { HistoryList } from "@/components/HistoryList";
import { IdentityGate } from "@/components/IdentityGate";
import { RoomPoller } from "@/components/RoomPoller";
import { ShareRoom } from "@/components/ShareRoom";
import { TallyList } from "@/components/TallyList";
import { getRoomByCode } from "@/db/queries";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/code";
import { getIdentity } from "@/lib/identity";

export async function generateMetadata({
  params,
}: PageProps<"/sala/[code]">): Promise<Metadata> {
  const code = normalizeRoomCode((await params).code);

  // Valida antes de consultar: sem isto, qualquer URL com lixo no lugar do
  // código gera uma query garantidamente infrutífera.
  if (!isValidRoomCode(code)) return { title: "Sala não encontrada" };

  const room = await getRoomByCode(code);
  return { title: room ? `${room.name} — Quites` : "Sala não encontrada" };
}

export default async function RoomPage({ params }: PageProps<"/sala/[code]">) {
  const { code: raw } = await params;
  const code = normalizeRoomCode(raw);

  if (!isValidRoomCode(code)) notFound();
  // Link colado em minúsculas continua funcionando, mas a URL canônica é maiúscula.
  if (code !== raw) redirect(`/sala/${code}`);

  const room = await getRoomByCode(code);
  if (!room) notFound();

  const identity = await getIdentity(code);
  // O cookie pode apontar para alguém que não está mais na sala.
  const me = room.tallies.find((person) => person.id === identity) ?? null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 py-8">
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          className="w-fit text-xs font-semibold uppercase tracking-widest text-muted"
        >
          ← Quites
        </Link>
        <h1 className="text-2xl leading-tight font-bold tracking-tight">
          {room.name}
        </h1>
        <ShareRoom code={room.code} roomName={room.name} />
      </header>

      {me ? (
        <>
          <BalanceBanner tallies={room.tallies} />
          <TallyList code={room.code} tallies={room.tallies} meId={me.id} />
          <HistoryList history={room.history} />

          <footer className="flex items-center justify-between gap-3 pt-2 text-sm text-muted">
            <span className="truncate">
              Você é <strong className="font-semibold text-text">{me.name}</strong>
            </span>
            <form action={switchIdentity}>
              <input type="hidden" name="code" value={room.code} />
              <button
                type="submit"
                className="min-h-11 rounded-lg px-2 underline underline-offset-4"
              >
                não sou eu
              </button>
            </form>
          </footer>

          <RoomPoller />
        </>
      ) : (
        <IdentityGate
          code={room.code}
          roomName={room.name}
          people={room.tallies}
        />
      )}
    </main>
  );
}
