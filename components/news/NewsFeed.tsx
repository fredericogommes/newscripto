"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, type Category, type NewsItem } from "@/lib/rss.ts";
import type { Region } from "@/lib/news-sources.ts";
import { ago } from "../format.ts";
import Thumb, { slug } from "./Thumb.tsx";

const TABS: ("Todas" | Category)[] = ["Todas", ...CATEGORIES];
const REGIONS: ("Todas as regiões" | Region)[] = ["Todas as regiões", "Brasil", "Global", "LatAm"];
const PAGE = 12;
// Mesma chave em que a calculadora guarda as posições.
const STORAGE_KEY = "jornal-cripto-posicoes";

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function NewsFeed({ items, renderedAt }: { items: NewsItem[]; renderedAt: number }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Todas");
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("Todas as regiões");
  const [query, setQuery] = useState("");
  const [mine, setMine] = useState(false);
  const [held, setHeld] = useState<string[]>([]);
  const [shown, setShown] = useState(PAGE);
  const [now, setNow] = useState(renderedAt);

  useEffect(() => {
    setNow(Date.now());
    const readHeld = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
        setHeld(Array.isArray(saved) ? saved.map((p: { ticker: string }) => p.ticker) : ["BTC", "SOL"]);
      } catch {
        setHeld(["BTC", "SOL"]);
      }
    };
    readHeld();
    window.addEventListener("focus", readHeld);
    return () => window.removeEventListener("focus", readHeld);
  }, []);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return items.filter(
      (i) =>
        (tab === "Todas" || i.category === tab) &&
        (region === "Todas as regiões" || i.region === region) &&
        (!mine || i.tickers.some((t) => held.includes(t))) &&
        (!q || fold(`${i.title} ${i.summary ?? ""} ${i.source}`).includes(q)),
    );
  }, [items, tab, region, query, mine, held]);
  const sources = new Set(items.map((i) => i.source)).size;
  const reset = () => setShown(PAGE);

  return (
    <section className="block section" id="noticias" aria-labelledby="noticias-title">
      <div className="feed-head">
        <h2 className="block-title" id="noticias-title">Notícias</h2>
        <span className="meta">
          {items.length} manchetes de {sources} portais · clique para ler na fonte
        </span>
      </div>
      <div className="tabs" role="tablist" aria-label="Editorias">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className="tab" onClick={() => { setTab(t); reset(); }}>
            {t}
          </button>
        ))}
      </div>
      <div className="feed-tools">
        <input
          type="search"
          placeholder="Buscar nas manchetes (ex.: ETF, Pix, Solana)"
          aria-label="Buscar nas manchetes"
          value={query}
          onChange={(e) => { setQuery(e.target.value); reset(); }}
        />
        <select aria-label="Região" value={region} onChange={(e) => { setRegion(e.target.value as Region); reset(); }}>
          {REGIONS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <button className="chip" aria-pressed={mine} onClick={() => { setMine(!mine); reset(); }} title={held.join(", ")}>
          Só da minha carteira
        </button>
      </div>
      <ol className="feed">
        {filtered.length === 0 && (
          <li className="meta empty">
            {mine && held.length === 0
              ? "Monte sua carteira na calculadora para filtrar as notícias dos seus ativos."
              : "Nenhuma manchete recente com esses filtros."}
          </li>
        )}
        {filtered.slice(0, shown).map((i) => (
          <li key={i.link}>
            <a className="row-card" href={i.link} target="_blank" rel="noopener">
              <Thumb item={i} />
              <span className="row-text">
                <span className={`cat cat-${slug(i.category)}`}>{i.category}</span>
                <span className="row-title">{i.title}</span>
                {i.summary && <span className="row-sum">{i.summary}</span>}
                <span className="byline">
                  {i.source} · {ago(Date.parse(i.publishedAt), now)}
                  {i.tickers.length > 0 && (
                    <span className="assets">
                      {i.tickers.map((t) => <span key={t} className="asset">{t}</span>)}
                    </span>
                  )}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
      {filtered.length > shown && (
        <div className="actions">
          <button className="btn ghost wide" onClick={() => setShown(shown + PAGE)}>
            Carregar mais notícias
          </button>
        </div>
      )}
    </section>
  );
}
