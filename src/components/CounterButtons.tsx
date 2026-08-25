"use client";

import { addEntry, removeLastEntry } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";

type Props = {
  code: string;
  participantId: number;
  name: string;
  count: number;
};

/**
 * O +1 vale para qualquer pessoa da sala: na prática quem está com o celular
 * na mão registra pelo grupo. O −1 é o par simétrico, para corrigir um toque
 * errado sem precisar de tela de histórico.
 */
export function CounterButtons({ code, participantId, name, count }: Props) {
  return (
    <div className="flex items-center gap-2">
      <form action={removeLastEntry}>
        <input type="hidden" name="code" value={code} />
        <input type="hidden" name="participantId" value={participantId} />
        <SubmitButton
          disabled={count === 0}
          aria-label={`Desfazer um pagamento de ${name}`}
          className="size-11 rounded-full border border-line text-muted text-xl
                     leading-none active:brightness-125"
        >
          −
        </SubmitButton>
      </form>

      <form action={addEntry}>
        <input type="hidden" name="code" value={code} />
        <input type="hidden" name="participantId" value={participantId} />
        <SubmitButton
          aria-label={`${name} pagou mais uma vez`}
          className="h-12 min-w-16 rounded-full bg-accent text-accent-ink
                     font-bold text-base active:brightness-90"
        >
          +1
        </SubmitButton>
      </form>
    </div>
  );
}
