/**
 * Fuso fixo em São Paulo: o app é para um grupo de amigos no Brasil e a
 * formatação acontece no servidor (que roda em UTC na Vercel). Fixar o fuso
 * evita mostrar "ontem" para algo que aconteceu há duas horas.
 */
const TZ = "America/Sao_Paulo";

const dayFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
});
const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
});

const ONE_DAY_MS = 86_400_000;

export function formatEntryTime(when: Date, now: Date = new Date()): string {
  const time = timeFmt.format(when);
  const day = dayFmt.format(when);

  if (day === dayFmt.format(now)) return `hoje ${time}`;
  if (day === dayFmt.format(new Date(now.getTime() - ONE_DAY_MS)))
    return `ontem ${time}`;

  return `${dateFmt.format(when)} ${time}`;
}
