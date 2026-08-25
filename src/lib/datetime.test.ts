import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatEntryTime } from "./datetime";

/** 25/08/2026 às 14:20 em São Paulo (UTC-3) = 17:20 UTC. */
const agora = new Date("2026-08-25T17:20:00Z");

describe("formatEntryTime", () => {
  it("mostra 'hoje' com a hora local de São Paulo, não UTC", () => {
    assert.equal(formatEntryTime(new Date("2026-08-25T17:20:00Z"), agora), "hoje 14:20");
  });

  it("mostra 'ontem'", () => {
    assert.equal(
      formatEntryTime(new Date("2026-08-24T22:05:00Z"), agora),
      "ontem 19:05",
    );
  });

  it("mais antigo que ontem mostra a data", () => {
    assert.equal(
      formatEntryTime(new Date("2026-08-12T11:30:00Z"), agora),
      "12/08 08:30",
    );
  });

  it("madrugada UTC ainda é 'hoje' no Brasil", () => {
    // 26/08 00:30 UTC = 25/08 21:30 em São Paulo — mesmo dia que `agora`.
    assert.equal(
      formatEntryTime(new Date("2026-08-26T00:30:00Z"), agora),
      "hoje 21:30",
    );
  });
});
