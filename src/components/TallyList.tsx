import { CounterButtons } from "./CounterButtons";
import { behindBy, type Tally } from "@/lib/balance";

type Props = {
  code: string;
  tallies: Tally[];
  meId: number | null;
};

export function TallyList({ code, tallies, meId }: Props) {
  return (
    <ul className="flex flex-col gap-2">
      {tallies.map((person) => {
        const behind = behindBy(tallies, person.id);
        const isMe = person.id === meId;

        return (
          <li
            key={person.id}
            className={`flex items-center gap-3 rounded-2xl border bg-surface p-3 ${
              isMe ? "border-accent/40" : "border-line"
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{person.name}</span>
                {isMe && (
                  <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    você
                  </span>
                )}
              </div>
              <p className="text-sm text-muted">
                {person.count === 1 ? "1 vez" : `${person.count} vezes`}
                {behind > 0 && (
                  <span className="text-warn"> · deve {behind}</span>
                )}
              </p>
            </div>

            <span
              aria-hidden
              className="font-mono text-3xl font-semibold tabular-nums"
            >
              {person.count}
            </span>

            <CounterButtons
              code={code}
              participantId={person.id}
              name={person.name}
              count={person.count}
            />
          </li>
        );
      })}
    </ul>
  );
}
