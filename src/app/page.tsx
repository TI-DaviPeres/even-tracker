import { CreateRoomForm } from "@/components/CreateRoomForm";
import { EnterRoomForm } from "@/components/EnterRoomForm";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Quites</h1>
        <p className="text-muted">
          Aquela compra que sempre se repete no grupo. Crie uma sala, mande o
          código e acompanhe quem já pagou quantas vezes.
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-semibold">Criar uma sala</h2>
        <CreateRoomForm />
      </section>

      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
        <span className="h-px flex-1 bg-line" />
        ou
        <span className="h-px flex-1 bg-line" />
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-semibold">Já tenho um código</h2>
        <EnterRoomForm />
      </section>
    </main>
  );
}
