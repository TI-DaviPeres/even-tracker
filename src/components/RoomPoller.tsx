"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const INTERVAL_MS = 5_000;

/**
 * Traz o que os amigos registraram sem precisar recarregar. É polling e não
 * realtime de propósito: 5s é imperceptível para este uso e não exige
 * nenhum serviço extra. Pausa quando a aba está oculta para não gastar
 * bateria nem compute-hours do Neon à toa.
 */
export function RoomPoller() {
  const router = useRouter();

  useEffect(() => {
    let timer: number | undefined;

    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(tick, INTERVAL_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        router.refresh(); // volta para a aba: atualiza na hora
        start();
      } else {
        window.clearInterval(timer);
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router]);

  return null;
}
