"use client";

import { useState } from "react";

type Props = { code: string; roomName: string };

/**
 * O código é a única chave da sala, então ele fica grande, monoespaçado e
 * fácil de copiar — e de ditar em voz alta no grupo.
 */
export function ShareRoom({ code, roomName }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const announce = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2_000);
  };

  const share = async () => {
    const url = `${window.location.origin}/sala/${code}`;
    const text = `Entra no contador "${roomName}" — código ${code}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Quites", text, url });
        return;
      } catch {
        // usuário cancelou o compartilhamento: cai no copiar
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      announce("Link copiado");
    } catch {
      announce("Copie o código manualmente");
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      announce("Código copiado");
    } catch {
      announce("Copie o código manualmente");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={copyCode}
        aria-label={`Copiar o código ${code}`}
        className="min-h-11 rounded-xl border border-line bg-surface px-3
                   font-mono text-lg font-semibold tracking-[0.2em]
                   active:brightness-125"
      >
        {code}
      </button>

      <button
        type="button"
        onClick={share}
        className="min-h-11 shrink-0 rounded-xl border border-line bg-surface-hi px-4
                   text-sm font-semibold active:brightness-125"
      >
        Convidar
      </button>

      <span aria-live="polite" className="sr-only">
        {feedback}
      </span>
      {feedback && (
        <span className="text-xs text-accent" aria-hidden>
          {feedback}
        </span>
      )}
    </div>
  );
}
