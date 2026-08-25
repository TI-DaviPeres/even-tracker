import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { behindBy, computeBalance, type Tally } from "./balance";

const p = (id: number, name: string, count: number): Tally => ({
  id,
  name,
  count,
});

describe("computeBalance", () => {
  it("uma pessoa só não tem com quem comparar", () => {
    assert.deepEqual(computeBalance([p(1, "Davi", 3)]), { kind: "alone" });
    assert.deepEqual(computeBalance([]), { kind: "alone" });
  });

  it("todo mundo em zero é 'ninguém registrou ainda', não 'quites'", () => {
    assert.deepEqual(computeBalance([p(1, "Davi", 0), p(2, "Lucas", 0)]), {
      kind: "untouched",
    });
  });

  it("contagens iguais e diferentes de zero são quites", () => {
    assert.deepEqual(computeBalance([p(1, "Davi", 4), p(2, "Lucas", 4)]), {
      kind: "even",
      count: 4,
    });
  });

  it("aponta líder, atrasado e a diferença", () => {
    assert.deepEqual(
      computeBalance([p(1, "Davi", 5), p(2, "Lucas", 3), p(3, "Bruno", 4)]),
      { kind: "uneven", leaders: ["Davi"], laggards: ["Lucas"], gap: 2 },
    );
  });

  it("agrupa empates no topo e na lanterna", () => {
    assert.deepEqual(
      computeBalance([p(1, "Davi", 5), p(2, "Lucas", 5), p(3, "Bruno", 1), p(4, "Ana", 1)]),
      {
        kind: "uneven",
        leaders: ["Davi", "Lucas"],
        laggards: ["Bruno", "Ana"],
        gap: 4,
      },
    );
  });

  it("alguém em zero ao lado de quem pagou não é 'untouched'", () => {
    assert.deepEqual(computeBalance([p(1, "Davi", 2), p(2, "Lucas", 0)]), {
      kind: "uneven",
      leaders: ["Davi"],
      laggards: ["Lucas"],
      gap: 2,
    });
  });
});

describe("behindBy", () => {
  const grupo = [p(1, "Davi", 5), p(2, "Lucas", 3), p(3, "Bruno", 5)];

  it("mede a distância até quem mais pagou", () => {
    assert.equal(behindBy(grupo, 2), 2);
  });

  it("quem está no topo não deve nada", () => {
    assert.equal(behindBy(grupo, 1), 0);
    assert.equal(behindBy(grupo, 3), 0);
  });

  it("id desconhecido ou grupo de um não quebra", () => {
    assert.equal(behindBy(grupo, 999), 0);
    assert.equal(behindBy([p(1, "Davi", 9)], 1), 0);
  });
});
