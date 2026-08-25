/**
 * Alfabeto sem I, O, 0 e 1: o código é ditado em voz alta no grupo, e esses
 * quatro são os que se confundem entre si. 32 caracteres, 32^6 ≈ 1,07 bilhão.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 6;

/**
 * Derivado do ALPHABET em vez de escrito à mão: um `[^A-Z2-9]` deixaria passar
 * I e O, que nunca aparecem num código de verdade — o resultado sairia com o
 * tamanho errado e o usuário veria "sala não encontrada" em vez de "confira o
 * código".
 */
const NOT_IN_ALPHABET = new RegExp(`[^${ALPHABET}]`, "g");

export function generateRoomCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let code = "";
  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length];
  }
  return code;
}

/** Normaliza o que o usuário digitou/colou para o formato canônico da sala. */
export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase().replace(NOT_IN_ALPHABET, "");
}

export function isValidRoomCode(input: string): boolean {
  const code = normalizeRoomCode(input);
  return (
    code.length === CODE_LENGTH &&
    [...code].every((char) => ALPHABET.includes(char))
  );
}
