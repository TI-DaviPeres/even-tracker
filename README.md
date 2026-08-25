# Quites

Contador compartilhado para aquela compra que sempre se repete no grupo de
amigos — energético, café, gelo. Alguém cria uma sala com o tema, manda o
código, e cada um vai registrando `+1` quando paga. A tela diz se o grupo está
quites ou quem está devendo.

Sem login: **o código da sala é a chave**. Quem tem o código pode registrar.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4** — tema escuro único, mobile-first
- **Postgres** + **Drizzle ORM** com o driver TCP genérico (`pg`)
- PWA instalável (`manifest.ts` + service worker mínimo)

O driver é o `pg` comum, não o driver HTTP do Neon, então **o mesmo código fala
com o Postgres do `docker-compose` no local e com qualquer Postgres hospedado em
produção**. No Fluid Compute da Vercel a função fica quente o suficiente para
reaproveitar a conexão TCP entre requests.

## Rodando local

O driver é o `pg` comum, então qualquer Postgres serve. Dois caminhos:

### Opção A — Postgres em Docker (recomendado)

```bash
npm install
docker compose up -d      # Postgres 18 em localhost:5433
cp .env.example .env.local
npm run db:push           # cria as 3 tabelas
npm run dev
```

A porta do host é **5433**, não 5432, para não colidir com os outros projetos
desta máquina que também sobem Postgres.

Para zerar o banco: `docker compose down -v && docker compose up -d && npm run db:push`.

### Opção B — direto no Neon de produção

```bash
npm install
npx vercel env pull .env.local
npm run dev
```

Menos um serviço rodando, mas **você passa a desenvolver contra o banco real**:

- Salas de teste ficam misturadas com as de verdade.
- A cota de compute do free tier é a mesma (100 CU-hours/mês no total), e o
  `npm run dev` com o poller de 5s mantém o compute acordado a sessão inteira —
  ou seja, desenvolver consome as horas que a produção também precisa.
- Um `db:push` distraído mexe no schema de produção.

Se quiser isolamento sem Docker, crie um branch `dev` no Neon (o free tier
permite 10) e use a connection string dele — os branches dividem a mesma cota de
compute, mas os dados ficam separados.

Nos dois casos, abra <http://localhost:3000>.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Testes da lógica pura (quites, código, fuso, validação) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:push` | Aplica o schema usando o `.env.local` |
| `npm run db:push:remote` | Aplica o schema na URL passada inline (produção) |
| `npm run db:studio` | Drizzle Studio |
| `npm run icons` | Regera os PNGs do PWA a partir de `public/icon.svg` |

Os scripts de banco passam por `node --env-file-if-exists=.env.local` porque o
`drizzle-kit` **não** carrega `.env.local` sozinho. O `db:push:remote` é a
exceção deliberada: sem env-file, para que a `DATABASE_URL` passada inline não
corra o risco de ser sobrescrita pela do Docker.

## Deploy

O app está na Vercel e o Postgres é um **Neon Free** criado pelo Marketplace da
Vercel, vinculado ao projeto. Isso significa que as variáveis de ambiente
(`DATABASE_URL` entre elas) são **injetadas automaticamente** em todos os
ambientes — não há nada para preencher à mão.

Deploy é `git push`: a Vercel builda sozinha, sem configuração.

Só o schema precisa ser aplicado à mão, uma vez (e de novo quando o schema
mudar). Use a connection string **direct/unpooled** — o pooler em modo
transaction quebra DDL:

```bash
npx vercel link                       # uma vez, para associar a pasta ao projeto
npx vercel env pull .env.vercel       # traz as variáveis do Neon
# use a variável unpooled (normalmente DATABASE_URL_UNPOOLED):
DATABASE_URL="<unpooled>" npm run db:push:remote
```

`db:push` fica **fora** do build de propósito: rodar migração de schema em cada
deploy é risco sem ganho num projeto deste tamanho.

### Custo

R$ 0. O Hobby da Vercel é gratuito sem cartão, e o plano Free do Neon **não
fatura excedente** — ao bater o limite ele suspende o compute, não cobra.

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
com a aba oculta e **encerrado após 15 min sem interação**. Esse limite não é
capricho: sem ele, uma aba de desktop esquecida aberta manteria o compute do
Postgres acordado 24h/dia e queimaria as 400h/mês do free tier em ~17 dias,
suspendendo o banco para todo mundo. Retoma no primeiro toque ou quando a aba
volta ao foco.

As mutações usam `refresh()` de `next/cache` (novo no Next 16) em vez de
`revalidatePath`: a página da sala é dinâmica porque lê cookies, então não
existe cache de rota para invalidar — o que se quer é atualizar o router do
cliente.

### SSL do banco

`src/db/index.ts` **não** passa opção `ssl`, de propósito: no `pg`, um `sslmode`
presente na connection string sobrescreve silenciosamente qualquer objeto `ssl`
passado no config. Deixar a string mandar faz os dois ambientes funcionarem sem
condicional — a do Neon vem com `sslmode=require`, a do Docker local não traz
nenhum.

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
