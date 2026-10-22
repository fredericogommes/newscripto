"use client";

import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/rss.ts";
import type { Region } from "@/lib/news-sources.ts";
import { relative } from "./format.ts";

const REGIONS: ("Todas" | Region)[] = ["Todas", "Brasil", "Global", "LatAm"];
const TICKERS = ["Todos", "BTC", "ETH", "SOL", "XRP", "USDT"];
const PAGE = 15;

export default function NewsRadar({ items, renderedAt }: { items: NewsItem[]; renderedAt: number }) {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("Todas");
  const [ticker, setTicker] = useState("Todos");
  const [shown, setShown] = useState(PAGE);
  const [now, setNow] = useState(renderedAt);
  useEffect(() => setNow(Date.now()), []);

  const filtered = items.filter(
    (i) => (region === "Todas" || i.region === region) && (ticker === "Todos" || i.tickers.includes(ticker)),
  );
  const sources = new Set(items.map((i) => i.source)).size;

  return (
    <section className="section" id="noticias">
      <div className="section-head">
        <p className="eyebrow">Radar de notícias · {sources} portais</p>
        <h2>O que os principais portais estão publicando agora</h2>
        <p className="meta">Manchetes dos portais de referência do Brasil e do mundo. Clique para ler na fonte original.</p>
      </div>
      <div className="filters" role="group" aria-label="Filtrar por região">
        {REGIONS.map((r) => (
          <button key={r} className="chip" aria-pressed={region === r} onClick={() => { setRegion(r); setShown(PAGE); }}>
            {r}
          </button>
        ))}
      </div>
      <div className="filters" role="group" aria-label="Filtrar por ativo">
        {TICKERS.map((t) => (
          <button key={t} className="chip small" aria-pressed={ticker === t} onClick={() => { setTicker(t); setShown(PAGE); }}>
            {t}
          </button>
        ))}
      </div>
      <ol className="radar">
        {filtered.length === 0 && <li className="meta">Nenhuma manchete recente com esse filtro.</li>}
        {filtered.slice(0, shown).map((i) => (
          <li key={i.link}>
            <span className="radar-meta">
              <span className="radar-time">{relative(Date.parse(i.publishedAt), now)}</span>
              <span className="tag">{i.source}</span>
            </span>
            <span className="radar-body">
              <a href={i.link} target="_blank" rel="noopener">{i.title}</a>
              {i.tickers.length > 0 && (
                <span className="assets">
                  {i.tickers.map((t) => <span key={t} className="asset">{t}</span>)}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
      {filtered.length > shown && (
        <div className="actions">
          <button className="btn ghost" onClick={() => setShown(shown + PAGE)}>Mostrar mais manchetes</button>
        </div>
      )}
    </section>
  );
}
