"use client";

import { useEffect } from "react";

/**
 * O service worker existe por um motivo específico: o Chrome só oferece o
 * prompt de instalação para páginas com HTTPS + manifest válido + um SW com
 * handler de `fetch`. Ele é deliberadamente burro (passa tudo para a rede) —
 * não tentamos funcionar offline, porque a sala é dado compartilhado e um
 * cache velho mostraria contagem errada.
 */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const timer = window.setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Falha ao registrar o service worker", error);
      });
    }, 1_000);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
