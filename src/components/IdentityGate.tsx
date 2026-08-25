"use client";

import { useActionState } from "react";

import { joinRoom, type ActionState } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";
import { PERSON_NAME_MAX } from "@/lib/validation";

const initial: ActionState = { error: null };

type Props = {
  code: string;
  roomName: string;
  people: { id: number; name: string }[];
};

/**
 * Primeira vez nesta sala neste navegador: descobrir quem é você. A escolha
 * vira um cookie httpOnly por sala (ver lib/identity.ts).
 */
export function IdentityGate({ code, roomName, people }: Props) {
  const [state, action] = useActionState(joinRoom, initial);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted">{roomName}</p>
        <h1 className="text-2xl font-semibold">Quem é você?</h1>
      </header>

      {people.length > 0 && (
        <form action={action} className="flex flex-col gap-2">
          <input type="hidden" name="code" value={code} />
          {people.map((person) => (
            <SubmitButton
              key={person.id}
              name="participantId"
              value={String(person.id)}
              className="min-h-13 rounded-xl border border-line bg-surface px-4
                         text-left text-base font-medium active:brightness-125"
            >
              {person.name}
            </SubmitButton>
          ))}
        </form>
      )}

      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="code" value={code} />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">
            {people.length > 0 ? "Ou entre com um nome novo" : "Seu nome"}
          </span>
          <input
            name="personName"
            required
            maxLength={PERSON_NAME_MAX}
            autoComplete="given-name"
            className="min-h-12 rounded-xl bg-ink border border-line px-4 text-base
                       outline-none focus:border-accent"
          />
        </label>

        {state.error && (
          <p role="alert" className="text-sm text-warn">
            {state.error}
          </p>
        )}

        <SubmitButton
          pendingLabel="Entrando..."
          className="min-h-13 rounded-xl bg-accent text-accent-ink font-semibold
                     active:brightness-90"
        >
          Entrar
        </SubmitButton>
      </form>
    </div>
  );
}
