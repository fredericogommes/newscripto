import type { MarketEvent } from "@/lib/types.ts";
import { dayLabel, timeLabel } from "../format.ts";

const BIAS_ICON = { up: "↑", down: "↓", vol: "↕", neu: "•" } as const;

export default function NextEvents({ events, now }: { events: MarketEvent[]; now: number }) {
  const next = events.filter((e) => Date.parse(e.startsAt) > now).slice(0, 5);
  if (next.length === 0) return null;
  return (
    <section className="widget" aria-labelledby="prox-title">
      <h2 className="block-title" id="prox-title">Próximos eventos</h2>
      <ol className="next">
        {next.map((e) => {
          const d = new Date(e.startsAt);
          return (
            <li key={e.slug}>
              <span className="next-when">
                <b>{dayLabel(d)}</b>
                <span className="meta">{e.allDay ? "dia todo" : `${e.timeConfirmed ? "" : "≈ "}${timeLabel(d)}`}</span>
              </span>
              <span className="next-body">
                <span>{e.title}</span>
                <span className={`bias ${e.bias}`}>{BIAS_ICON[e.bias]} {e.biasLabel}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <a className="more" href="/#agenda">Agenda completa →</a>
    </section>
  );
}
