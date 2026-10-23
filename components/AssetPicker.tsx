"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AssetProfile } from "@/lib/types.ts";
import { brlPrice, signedPct } from "./format.ts";

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const LIMIT = 60;

/** Seletor de ativo com busca por nome ou ticker e filtro por corretora. */
export default function AssetPicker({
  value,
  profiles,
  exchanges,
  onChange,
  id,
}: {
  value: string;
  profiles: AssetProfile[];
  exchanges: string[];
  onChange: (ticker: string) => void;
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [ex, setEx] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const current = profiles.find((p) => p.ticker === value);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const matches = useMemo(() => {
    const f = fold(q.trim());
    const list = profiles.filter(
      (p) =>
        (!ex || p.exchanges?.includes(ex)) &&
        (!f || fold(p.ticker).startsWith(f) || fold(p.name).includes(f)),
    );
    // Ticker exato primeiro, depois pelo ranking.
    return list.sort((a, b) => Number(fold(b.ticker) === f) - Number(fold(a.ticker) === f) || (a.rank ?? 9999) - (b.rank ?? 9999));
  }, [profiles, q, ex]);

  const pick = (t: string) => {
    onChange(t);
    setOpen(false);
    setQ("");
  };

  return (
    <div className="picker" ref={box}>
      <button
        type="button"
        id={id}
        className="picker-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {current?.image ? <img src={current.image} alt="" width={20} height={20} /> : <span className="coin-dot" aria-hidden="true" />}
        <b>{value}</b>
        <span className="picker-name">{current?.name}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="picker-pop" role="dialog" aria-label="Escolher ativo">
          <input
            ref={input}
            type="search"
            placeholder={`Buscar entre ${profiles.length} moedas`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter" && matches[0]) {
                e.preventDefault();
                pick(matches[0].ticker);
              }
            }}
          />
          {exchanges.length > 0 && (
            <div className="picker-ex" role="group" aria-label="Corretora">
              <button type="button" className="chip small" aria-pressed={ex === null} onClick={() => setEx(null)}>Todas</button>
              {exchanges.map((e) => (
                <button key={e} type="button" className="chip small" aria-pressed={ex === e} onClick={() => setEx(ex === e ? null : e)}>
                  {e}
                </button>
              ))}
            </div>
          )}
          <ul role="listbox" aria-label="Moedas">
            {matches.slice(0, LIMIT).map((p) => (
              <li key={p.ticker} role="option" aria-selected={p.ticker === value}>
                <button type="button" onClick={() => pick(p.ticker)}>
                  {p.image ? <img src={p.image} alt="" width={20} height={20} loading="lazy" /> : <span className="coin-dot" aria-hidden="true" />}
                  <span className="pk-main">
                    <b>{p.ticker}</b> <span className="meta">{p.name}</span>
                    {p.exchanges && p.exchanges.length > 0 && (
                      <span className="pk-ex">{p.exchanges.join(" · ")}</span>
                    )}
                  </span>
                  <span className="pk-px num">
                    {p.priceBrl !== undefined ? brlPrice(p.priceBrl) : ""}
                    {p.change24h !== undefined && (
                      <span className={`chg ${p.change24h >= 0 ? "up" : "down"}`}>{signedPct(p.change24h)}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
            {matches.length === 0 && <li className="meta pk-empty">Nenhuma moeda encontrada. Use “OUTRO” para um ativo fora da lista.</li>}
            {matches.length > LIMIT && <li className="meta pk-empty">Mostrando {LIMIT} de {matches.length}. Refine a busca.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
