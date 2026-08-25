# Quites

Contador compartilhado para aquela compra que sempre se repete no grupo de
amigos — energético, café, gelo. Alguém cria uma sala com o tema, manda o
código, e cada um vai registrando `+1` quando paga. A tela diz se o grupo está
quites ou quem está devendo.

Sem login: **o código da sala é a chave**. Quem tem o código pode registrar.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4** — tema escuro único, mobile-first
- **Neon Postgres** + **Drizzle ORM** (driver HTTP `@neondatabase/serverless`)
- PWA instalável (`manifest.ts` + service worker mínimo)

## Rodando local

Você precisa de uma `DATABASE_URL` apontando para um Postgres do Neon — o
driver HTTP do Neon não fala com um Postgres comum, então não dá para usar um
container local sem proxy. O caminho curto é criar o banco na Vercel (ver
[Deploy](#deploy)) e puxar as variáveis:

```bash
npm install
npx vercel env pull .env.local   # ou copie .env.example e cole a string do Neon
npm run db:push                  # cria as tabelas
npm run dev
```

Abra <http://localhost:3000>.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:push` | Aplica o schema no banco |
| `npm run db:studio` | Drizzle Studio |
| `npm run icons` | Regera os PNGs do PWA a partir de `public/icon.svg` |

Os scripts de banco passam por `node --env-file-if-exists=.env.local` porque o
`drizzle-kit` **não** carrega `.env.local` sozinho.

## Deploy

1. `git push` para o GitHub.
2. Em [vercel.com](https://vercel.com) → *Add New Project* → importe o repo.
   Next.js é detectado sozinho, sem configuração.
3. Aba **Storage** → *Marketplace* → **Neon** → criar o banco. As variáveis
   (`DATABASE_URL` entre elas) são injetadas em todos os ambientes
   automaticamente e a cobrança sai pela própria Vercel.
4. Aplique o schema uma vez: `npx vercel env pull .env.local && npm run db:push`.
5. Redeploy.

`db:push` fica **fora** do build de propósito: rodar migração de schema em cada
deploy é risco sem ganho num projeto deste tamanho.

## Como funciona

### Modelo de dados

`rooms` → `participants` → `entries`. As contagens **não** são uma coluna: são
derivadas de `entries`, uma linha por pagamento. É isso que dá histórico e
permite desfazer.

### Identidade sem login

Ao entrar, a pessoa escolhe quem é e isso vira um cookie `httpOnly` por sala
(`src/lib/identity.ts`). Cookie em vez de `localStorage` porque o Server
Component já renderiza sabendo quem você é — sem piscar o "Quem é você?" na
hidratação.

O cookie é editável pelo usuário, então a identidade **não** é à prova de
fraude. Isso é intencional: o portão de escrita é o código da sala, e o `+1`
funciona para qualquer pessoa da sala — na prática quem está com o celular na
mão registra pelo grupo.

### Atualização entre amigos

Polling de 5s via `router.refresh()` (`src/components/RoomPoller.tsx`), pausado
quando a aba está oculta. Não é realtime de propósito: 5s é imperceptível para
este uso e não exige nenhum serviço extra.

As mutações usam `refresh()` de `next/cache` (novo no Next 16) em vez de
`revalidatePath`: a página da sala é dinâmica porque lê cookies, então não
existe cache de rota para invalidar — o que se quer é atualizar o router do
cliente.

### Service worker

`public/sw.js` existe por um motivo único: o Chrome só oferece o prompt de
instalação para páginas com HTTPS + manifest válido + **um service worker com
handler de `fetch`**. Ele repassa tudo para a rede e não faz cache — a
contagem é dado compartilhado, e servir cache mostraria número velho como se
fosse atual.

## Limites conhecidos

- **Sem login** e identidade falsificável (acima).
- **Sem rate limit**: um `+1` em looping poluiria a sala. Para um grupo de
  amigos não vale o custo.
- **Cold start** do Neon no free tier: a primeira requisição depois de um tempo
  parado pode levar ~1s.
- **Sem valor em R$**, só contagem. Se precisar, é uma coluna `amount` opcional
  em `entries` e um segundo cálculo em `src/lib/balance.ts`.
- O histórico é formatado com fuso fixo em `America/Sao_Paulo`
  (`src/lib/datetime.ts`), já que a formatação acontece no servidor.
