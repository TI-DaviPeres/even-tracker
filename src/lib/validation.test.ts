import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeName,
  PERSON_NAME_MAX,
  validatePersonName,
  validateRoomName,
} from "./validation";

describe("normalizeName", () => {
  it("colapsa espaços para 'Davi ' e 'Davi' não virarem pessoas diferentes", () => {
    assert.equal(normalizeName("  Davi  "), "Davi");
    assert.equal(normalizeName("Davi   Peres"), "Davi Peres");
    assert.equal(normalizeName("Davi\tPeres\n"), "Davi Peres");
  });
});

describe("validateRoomName", () => {
  it("aceita um tema normal", () => {
    assert.equal(validateRoomName("Compra de Energético"), null);
  });

  it("rejeita curto demais, inclusive só espaços", () => {
    assert.ok(validateRoomName("a"));
    assert.ok(validateRoomName("   "));
  });

  it("rejeita longo demais", () => {
    assert.ok(validateRoomName("x".repeat(61)));
  });
});

describe("validatePersonName", () => {
  it("aceita um nome normal", () => {
    assert.equal(validatePersonName("Davi"), null);
  });

  it("rejeita curto e longo demais", () => {
    assert.ok(validatePersonName("D"));
    assert.ok(validatePersonName("x".repeat(PERSON_NAME_MAX + 1)));
  });
});
