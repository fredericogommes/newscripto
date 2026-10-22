"use client";

import { useState } from "react";
import type { AssetProfile, EventCategory, MarketEvent } from "@/lib/types.ts";
import { eventTouches } from "@/lib/risk.ts";
import { dayLabel, relative, timeLabel, weekdayLabel } from "./format.ts";

type Filter = "all" | "mine" | EventCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "rede", label: "Atualização de rede" },
  { id: "unlock", label: "Desbloqueio" },
  { id: "macro", label: "Macro" },
  { id: "reg", label: "Regulação e Brasil" },
  { id: "mine", label: "Só da minha carteira" },
];

const BIAS_ICON = { up: "↑", down: "↓", vol: "↕", neu: "•" } as const;

const assetLabel = (a: string) => (a === "*" ? "todo o mercado" : a === "BR" ? "usuários no Brasil" : a);

export default function Agenda({
  events,
  held,
  profiles,
  now,
}: {
  events: MarketEvent[];
  held: string[];
  profiles: Record<string, AssetProfile>;
  now: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = events.filter((e) =>
    filter === "all" ? true : filter === "mine" ? eventTouches(e, held, profiles) : e.category === filter,
  );

  return (
    <section className="section" id="agenda">
      <div className="section-head">
        <p className="eyebrow">Agenda · horário de Brasília</p>
        <h2>O que vem por aí e como o mercado costuma reagir</h2>
        <p className="meta">
          Atualizações de rede, desbloqueios de tokens, macro e regulação. Horários marcados com ≈ seguem o padrão do
          evento e ainda serão confirmados pela fonte.
        </p>
      </div>
      <div className="filters" role="group" aria-label="Filtrar agenda">
        {FILTERS.map((f) => (
          <button key={f.id} className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="timeline">
        {shown.length === 0 && <p className="meta">Nenhum evento na agenda para os ativos da sua carteira.</p>}
        {shown.map((e) => {
          const date = new Date(e.startsAt);
          const past = date.getTime() < now - (e.allDay ? 864e5 : 0);
          const year = date.getFullYear() !== new Date(now).getFullYear() ? ` ${date.getFullYear()}` : "";
          const hour = e.allDay ? "dia todo" : `${e.timeConfirmed ? "" : "≈ "}${timeLabel(date)}`;
          return (
            <article key={e.slug} className={`ev${past ? " past" : ""}`}>
              <div className="when">
                <span className="day">
                  {dayLabel(date)}
                  {year}
                </span>
                <span className="meta">
                  {weekdayLabel(date)} · {hour}
                </span>
                <span className="countdown">{relative(date.getTime(), now)}</span>
              </div>
              <div className="body">
                <h3>{e.title}</h3>
                <p>{e.description}</p>
                {e.note && <p className="meta">{e.note}</p>}
                <div className="assets">
                  {e.assets.map((a) => (
                    <span key={a} className="asset">
                      {assetLabel(a)}
                    </span>
                  ))}
                </div>
              </div>
              <span className={`bias ${e.bias}`}>
                {BIAS_ICON[e.bias]} {e.biasLabel}
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
