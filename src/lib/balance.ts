export type Tally = {
  id: number;
  name: string;
  count: number;
};

export type Balance =
  /** Uma pessoa só: não há o que comparar ainda. */
  | { kind: "alone" }
  /** Todo mundo em zero. */
  | { kind: "untouched" }
  /** Contagens iguais — quites. */
  | { kind: "even"; count: number }
  /** Alguém na frente. `gap` = quanto o último precisa pagar para empatar. */
  | { kind: "uneven"; leaders: string[]; laggards: string[]; gap: number };

/**
 * Função pura: recebe as contagens e diz o estado do acerto.
 * Toda a regra de "quites" vive aqui para poder ser testada sem banco.
 */
export function computeBalance(tallies: Tally[]): Balance {
  if (tallies.length < 2) return { kind: "alone" };

  const counts = tallies.map((t) => t.count);
  const max = Math.max(...counts);
  const min = Math.min(...counts);

  if (max === 0) return { kind: "untouched" };
  if (max === min) return { kind: "even", count: max };

  return {
    kind: "uneven",
    leaders: tallies.filter((t) => t.count === max).map((t) => t.name),
    laggards: tallies.filter((t) => t.count === min).map((t) => t.name),
    gap: max - min,
  };
}

/** Quantas vezes esta pessoa está atrás de quem mais pagou. */
export function behindBy(tallies: Tally[], id: number): number {
  if (tallies.length < 2) return 0;
  const max = Math.max(...tallies.map((t) => t.count));
  const mine = tallies.find((t) => t.id === id);
  return mine ? max - mine.count : 0;
}
