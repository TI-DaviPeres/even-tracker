"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const INTERVAL_MS = 5_000;
/**
 * Depois disso sem interação, para de atualizar. O motivo é concreto: uma aba de
 * desktop esquecida aberta manteria o compute do Postgres acordado 24h/dia. No
 * free tier do Neon são 400h/mês, ou seja, uma aba esquecida queimaria a cota do
 * mês inteiro em ~17 dias e o banco suspenderia para todo mundo.
 */
const IDLE_LIMIT_MS = 15 * 60_000;

/**
 * Traz o que os amigos registraram sem precisar recarregar. É polling e não
 * realtime de propósito: 5s é imperceptível para este uso e não exige nenhum
 * serviço extra. Pausa com a aba oculta e para de vez depois de 15 min parado.
 */
export function RoomPoller() {
  const router = useRouter();

  useEffect(() => {
    let timer: number | undefined;
    let lastActivity = Date.now();

    const stop = () => {
      window.clearInterval(timer);
      timer = undefined;
    };

    const tick = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastActivity > IDLE_LIMIT_MS) {
        stop();
        return;
      }
      router.refresh();
    };

    const start = () => {
      stop();
      timer = window.setInterval(tick, INTERVAL_MS);
    };

    const onActivity = () => {
      lastActivity = Date.now();
      // Só atualiza se o polling estava parado. Atualizar a cada toque
      // transformaria a economia em mais carga do que ela evita.
      if (timer !== undefined || document.visibilityState !== "visible") return;
      router.refresh();
      start();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") onActivity();
      else stop();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointerdown", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity, { passive: true });

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [router]);

  return null;
}
