import { cookies } from "next/headers";

/**
 * "Quem sou eu" mora num cookie httpOnly por sala, em vez de localStorage:
 * o Server Component já renderiza sabendo quem você é (sem piscar o
 * "Quem é você?" na hidratação) e as Server Actions leem a identidade do
 * cookie em vez de confiar num id mandado pelo cliente.
 *
 * Não é à prova de fraude — o cookie é editável e não há login. O segredo
 * real é o código da sala. Isso é intencional para um app entre amigos.
 */
const ONE_YEAR = 60 * 60 * 24 * 365;

function cookieName(code: string): string {
  return `et_${code}`;
}

export async function getIdentity(code: string): Promise<number | null> {
  const store = await cookies();
  const raw = store.get(cookieName(code))?.value;
  if (!raw) return null;
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Só pode ser chamada dentro de uma Server Action ou Route Handler. */
export async function setIdentity(
  code: string,
  participantId: number,
): Promise<void> {
  const store = await cookies();
  store.set(cookieName(code), String(participantId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  });
}

export async function clearIdentity(code: string): Promise<void> {
  const store = await cookies();
  store.delete(cookieName(code));
}
