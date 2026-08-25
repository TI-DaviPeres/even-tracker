import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CODE_LENGTH,
  generateRoomCode,
  isValidRoomCode,
  normalizeRoomCode,
} from "./code";

describe("generateRoomCode", () => {
  it("gera 6 caracteres sempre válidos", () => {
    for (let i = 0; i < 500; i += 1) {
      const code = generateRoomCode();
      assert.equal(code.length, CODE_LENGTH);
      assert.ok(isValidRoomCode(code), `código inválido: ${code}`);
    }
  });

  it("nunca usa caracteres ambíguos ao ditar", () => {
    const ambiguos = /[01IO]/;
    for (let i = 0; i < 500; i += 1) {
      assert.ok(!ambiguos.test(generateRoomCode()));
    }
  });

  it("não repete na prática", () => {
    const vistos = new Set(
      Array.from({ length: 300 }, () => generateRoomCode()),
    );
    assert.ok(vistos.size > 295, `colisões demais: ${vistos.size}`);
  });
});

describe("normalizeRoomCode", () => {
  it("aceita minúsculas, espaços e separadores colados do WhatsApp", () => {
    assert.equal(normalizeRoomCode(" a7k2qp "), "A7K2QP");
    assert.equal(normalizeRoomCode("A7K2-QP"), "A7K2QP");
  });

  it("descarta caracteres fora do alfabeto", () => {
    assert.equal(normalizeRoomCode("A7K2QP!"), "A7K2QP");
    assert.equal(normalizeRoomCode("código: A7K2QP"), "CDGA7K2QP");
  });
});

describe("isValidRoomCode", () => {
  it("rejeita tamanho errado", () => {
    assert.ok(!isValidRoomCode("A7K2Q"));
    assert.ok(!isValidRoomCode("A7K2QPX"));
    assert.ok(!isValidRoomCode(""));
  });

  it("rejeita código que só tem caracteres ambíguos", () => {
    assert.ok(!isValidRoomCode("OIL011"));
  });

  it("aceita um código bom em qualquer caixa", () => {
    assert.ok(isValidRoomCode("A7K2QP"));
    assert.ok(isValidRoomCode("a7k2qp"));
  });
});
