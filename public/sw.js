/*
 * Service worker mínimo. Só existe para satisfazer o critério de
 * instalabilidade do Chrome (que exige um handler de `fetch`).
 *
 * Não faz cache de propósito: a contagem da sala é compartilhada e servir
 * uma versão em cache mostraria um número desatualizado como se fosse atual.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
