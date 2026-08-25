import type { HistoryItem } from "@/db/queries";
import { formatEntryTime } from "@/lib/datetime";

export function HistoryList({ history }: { history: HistoryItem[] }) {
  if (history.length === 0) return null;

  const now = new Date();

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-muted">Histórico</h2>
      <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
        {history.map((item) => (
          <li
            key={item.id}
            className="flex items-baseline justify-between gap-3 px-4 py-2.5 text-sm"
          >
            <span className="truncate">{item.name}</span>
            <span className="shrink-0 text-muted tabular-nums">
              {formatEntryTime(item.createdAt, now)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
