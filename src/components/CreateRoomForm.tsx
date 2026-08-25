"use client";

import { useActionState } from "react";

import { createRoom, type ActionState } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";
import { PERSON_NAME_MAX, ROOM_NAME_MAX } from "@/lib/validation";

const initial: ActionState = { error: null };

export function CreateRoomForm() {
  const [state, action] = useActionState(createRoom, initial);

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">O que vocês dividem</span>
        <input
          name="roomName"
          required
          maxLength={ROOM_NAME_MAX}
          autoComplete="off"
          className="min-h-12 rounded-xl bg-ink border border-line px-4 text-base
                     outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Seu nome</span>
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
        pendingLabel="Criando..."
        className="min-h-13 rounded-xl bg-accent text-accent-ink font-semibold text-base
                   active:brightness-90"
      >
        Criar sala
      </SubmitButton>
    </form>
  );
}
