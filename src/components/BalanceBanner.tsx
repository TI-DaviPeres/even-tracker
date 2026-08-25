import { computeBalance, type Tally } from "@/lib/balance";

function joinNames(names: string[]): string {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

/** O veredito da sala: quites ou quem está devendo. */
export function BalanceBanner({ tallies }: { tallies: Tally[] }) {
  const balance = computeBalance(tallies);

  const { tone, text } = (() => {
    switch (balance.kind) {
      case "alone":
        return {
          tone: "muted" as const,
          text: "Mande o código para os amigos entrarem.",
        };
      case "untouched":
        return {
          tone: "muted" as const,
          text: "Ninguém registrou nada ainda.",
        };
      case "even":
        return {
          tone: "good" as const,
          text: `Todos quites — ${balance.count} ${
            balance.count === 1 ? "vez" : "vezes"
          } cada.`,
        };
      case "uneven": {
        const vezes = balance.gap === 1 ? "vez" : "vezes";
        return {
          tone: "warn" as const,
          text: `${joinNames(balance.leaders)} está ${balance.gap} ${vezes} na frente de ${joinNames(balance.laggards)}.`,
        };
      }
    }
  })();

  const styles = {
    good: "border-accent/40 bg-accent/10 text-accent",
    warn: "border-warn/40 bg-warn/10 text-warn",
    muted: "border-line bg-surface text-muted",
  }[tone];

  return (
    <p
      aria-live="polite"
      className={`rounded-2xl border px-4 py-3 text-sm font-medium ${styles}`}
    >
      {tone === "good" ? "⚖ " : ""}
      {text}
    </p>
  );
}
