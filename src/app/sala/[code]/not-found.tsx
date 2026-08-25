import Link from "next/link";

export default function RoomNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-5 py-10">
      <h1 className="text-2xl font-semibold">Sala não encontrada</h1>
      <p className="text-muted">
        Esse código não existe. Confira as letras com quem te chamou — o código
        tem 6 caracteres e não usa as letras I e O nem os números 0 e 1.
      </p>
      <Link
        href="/"
        className="flex min-h-13 items-center justify-center rounded-xl bg-accent
                   font-semibold text-accent-ink active:brightness-90"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
