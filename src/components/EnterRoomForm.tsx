"use client";

import { useActionState } from "react";

import { enterRoom, type ActionState } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";
import { CODE_LENGTH } from "@/lib/code";

const initial: ActionState = { error: null };

export function EnterRoomForm() {
  const [state, action] = useActionState(enterRoom, initial);

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Código da sala (6 caracteres)</span>
        <input
          name="code"
          required
          maxLength={CODE_LENGTH}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="min-h-12 rounded-xl bg-ink border border-line px-4
                     font-mono text-xl tracking-[0.3em] uppercase
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
        className="min-h-13 rounded-xl border border-line bg-surface-hi font-semibold text-base
                   active:brightness-110"
      >
        Entrar na sala
      </SubmitButton>
    </form>
  );
}
