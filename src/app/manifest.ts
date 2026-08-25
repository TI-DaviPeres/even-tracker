import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quites — contador entre amigos",
    short_name: "Quites",
    description:
      "Contador compartilhado para saber quem já pagou quantas vezes naquela compra que sempre se repete.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b1017",
    theme_color: "#0b1017",
    lang: "pt-BR",
    categories: ["utilities", "finance"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
