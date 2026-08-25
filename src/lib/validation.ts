export const ROOM_NAME_MAX = 60;
export const PERSON_NAME_MAX = 24;

/** Colapsa espaços e corta as pontas — evita "Davi " e "Davi" como pessoas diferentes. */
export function normalizeName(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function validateRoomName(input: string): string | null {
  const name = normalizeName(input);
  if (name.length < 2) return "Dê um nome de pelo menos 2 letras ao tema.";
  if (name.length > ROOM_NAME_MAX)
    return `O nome do tema passa de ${ROOM_NAME_MAX} caracteres.`;
  return null;
}

export function validatePersonName(input: string): string | null {
  const name = normalizeName(input);
  if (name.length < 2) return "Seu nome precisa de pelo menos 2 letras.";
  if (name.length > PERSON_NAME_MAX)
    return `Use no máximo ${PERSON_NAME_MAX} caracteres.`;
  return null;
}
