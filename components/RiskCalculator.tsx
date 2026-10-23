"use client";

import { useMemo, useState } from "react";
import type { AssetProfile, MarketEvent, Position } from "@/lib/types.ts";
import { btcShock, type RiskReport } from "@/lib/risk.ts";
import { brl, brlPrice, pct, relative, signedPct } from "./format.ts";
import AssetPicker from "./AssetPicker.tsx";

type Tab = "cenarios" | "ativos" | "concentracao" | "atencao";
const TABS: { id: Tab; label: string }[] = [
  { id: "cenarios", label: "Cenários" },
  { id: "ativos", label: "Por ativo" },
  { id: "concentracao", label: "Concentração" },
  { id: "atencao", label: "Pontos de atenção" },
];

const signedBrl = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${brl(Math.abs(n))}`;
const tone = (n: number | undefined) => (n === undefined ? "" : n >= 0 ? "up" : "down");

export default function RiskCalculator({
  positions,
  profiles,
  exchanges,
  universeAsOf,
  report,
  upcoming,
  now,
  onChange,
  onReset,
}: {
  positions: Position[];
  profiles: AssetProfile[];
  exchanges: string[];
  universeAsOf: string | null;
  report: RiskReport | null;
  upcoming: MarketEvent[];
  now: number;
  onChange: (next: Position[]) => void;
  onReset: () => void;
}) {
  const [tab, setTab] = useState<Tab>("cenarios");
  const [shock, setShock] = useState(-15);
  const byTicker = useMemo(() => Object.fromEntries(profiles.map((p) => [p.ticker, p])), [profiles]);
  const set = (i: number, patch: Partial<Position>) =>
    onChange(positions.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const measured = profiles.filter((p) => p.measured).length;

  const flags: string[] = [];
  if (report) {
    const top = report.holdings[0];
    if (top.weight > 0.6) flags.push(`${pct(top.weight)} da carteira está em ${top.ticker}. Um evento nesse ativo mexe com quase tudo.`);
    const riskTop = [...report.holdings].sort((a, b) => b.riskShare - a.riskShare)[0];
    if (riskTop.riskShare > top.weight + 0.15)
      flags.push(`${riskTop.ticker} tem ${pct(riskTop.weight)} do valor, mas responde por ${pct(riskTop.riskShare)} da oscilação.`);
    if (report.altShare > 0.4) flags.push(`${pct(report.altShare)} em altcoins, que historicamente caem mais que o BTC nas quedas (beta acima de 1).`);
    if (report.beta > 1.3) flags.push(`A carteira se move, em média, ${report.beta.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} vezes o BTC.`);
    for (const h of report.holdings) {
      const p = byTicker[h.ticker];
      if (p?.athChange !== undefined && p.athChange < -80) flags.push(`${h.ticker} está ${pct(-p.athChange / 100)} abaixo da máxima histórica.`);
      if (p?.exchanges && p.exchanges.length === 0 && !p.isStable && h.ticker !== "OUTRO")
        flags.push(`${h.ticker} não aparece nas grandes corretoras acompanhadas; liquidez pode ser baixa.`);
    }
    for (const e of upcoming) flags.push(`${e.title}, ${relative(Date.parse(e.startsAt), now)}: ${e.biasLabel.toLowerCase()}.`);
    if (!flags.length) flags.push("Nenhum ponto de atenção para os próximos 14 dias.");
  }

  const downloadCsv = () => {
    if (!report) return;
    const rows = [
      ["Ativo", "Valor (R$)", "Peso", "Vol. anual", "Beta vs BTC", "Parte do risco", "VaR 95% 1 dia (R$)"],
      ...report.holdings.map((h) => [
        h.ticker,
        h.valueBrl.toFixed(2),
        (h.weight * 100).toFixed(1) + "%",
        (h.annualVol * 100).toFixed(0) + "%",
        h.beta.toFixed(2),
        (h.riskShare * 100).toFixed(1) + "%",
        h.var95DayBrl.toFixed(2),
      ]),
      [],
      ["Total", report.totalBrl.toFixed(2)],
      ["Índice de risco", String(report.score)],
      ["VaR 95% 1 dia", report.var95DayBrl.toFixed(2)],
      ["VaR 95% 7 dias", report.var95WeekBrl.toFixed(2)],
      ["VaR 99% 1 dia", report.var99DayBrl.toFixed(2)],
      ["Perda média nos 5% piores dias", report.es95DayBrl.toFixed(2)],
      [],
      ["Conteúdo informativo. Não é recomendação de investimento."],
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "risco-carteira.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="section" id="risco">
      <div className="section-head">
        <p className="eyebrow">Calculadora de risco</p>
        <h2>Quanto sua carteira pode oscilar</h2>
        <p className="meta">
          {profiles.length} moedas
          {exchanges.length > 0 ? ` negociadas em ${exchanges.join(", ")}` : ""}, com preço em reais. Informe em R$ ou em
          quantidade; as posições ficam salvas só neste navegador.
        </p>
      </div>
      <div className="calc">
        <form className="panel" onSubmit={(e) => e.preventDefault()}>
          <h3>Suas posições</h3>
          <div className="rows">
            {positions.map((p, i) => {
              const prof = byTicker[p.ticker];
              const byQty = p.qty !== undefined && prof?.priceBrl !== undefined;
              const value = byQty ? p.qty! * prof!.priceBrl! : p.valueBrl;
              return (
                <div className="pos" key={i}>
                  <AssetPicker
                    id={`ativo-${i}`}
                    value={p.ticker}
                    profiles={profiles}
                    exchanges={exchanges}
                    onChange={(t) => set(i, { ticker: t, qty: byTicker[t]?.priceBrl !== undefined ? p.qty : undefined })}
                  />
                  <div className="pos-input">
                    <div className="seg" role="group" aria-label="Informar por">
                      <button type="button" aria-pressed={!byQty} onClick={() => set(i, { qty: undefined, valueBrl: Math.round(value) })}>R$</button>
                      <button
                        type="button"
                        aria-pressed={byQty}
                        disabled={prof?.priceBrl === undefined}
                        title={prof?.priceBrl === undefined ? "Sem preço ao vivo para este ativo" : "Informar quantidade"}
                        onClick={() => set(i, { qty: prof?.priceBrl ? +(value / prof.priceBrl).toPrecision(6) : undefined })}
                      >
                        Qtd
                      </button>
                    </div>
                    <input
                      id={`valor-${i}`}
                      type="number"
                      min={0}
                      step="any"
                      inputMode="decimal"
                      aria-label={byQty ? `Quantidade de ${p.ticker}` : "Valor em reais"}
                      value={byQty ? p.qty : p.valueBrl}
                      onChange={(e) => {
                        const n = Math.max(0, Number(e.target.value) || 0);
                        set(i, byQty ? { qty: n, valueBrl: n * prof!.priceBrl! } : { valueBrl: n });
                      }}
                    />
                    <button type="button" className="x" aria-label={`Remover ${p.ticker}`} onClick={() => onChange(positions.filter((_, j) => j !== i))}>
                      ×
                    </button>
                  </div>
                  <p className="pos-meta meta">
                    {prof?.priceBrl !== undefined && <span className="num">{brlPrice(prof.priceBrl)}</span>}
                    {prof?.change24h !== undefined && <span className={`num chg ${tone(prof.change24h)}`}>{signedPct(prof.change24h)} 24h</span>}
                    {byQty && <span>= <b className="num">{brl(value)}</b></span>}
                    {prof?.exchanges && prof.exchanges.length > 0 && <span>{prof.exchanges.length} corretoras</span>}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => onChange([...positions, { ticker: "ETH", valueBrl: 5000 }])}>
              Adicionar ativo
            </button>
            <button type="button" className="btn ghost" onClick={onReset}>Voltar ao exemplo</button>
            <button type="button" className="btn ghost" onClick={downloadCsv} disabled={!report}>Baixar CSV</button>
          </div>
          <details>
            <summary className="meta">Como o cálculo é feito</summary>
            <div className="meta assumptions">
              <p>
                Lista: as maiores moedas da CoinGecko que estão à venda em pelo menos uma das corretoras acompanhadas
                {universeAsOf ? `, atualizada a cada hora` : ""}. Volatilidade e beta contra o BTC medidos nos preços de hora em
                hora dos últimos 7 dias ({measured} moedas), misturados com uma referência pelo tamanho da moeda porque uma
                semana é pouco tempo.
              </p>
              <p>
                Cada ativo tem uma parte do risco que acompanha o BTC e uma parte própria. Stablecoins não acompanham o BTC.
                VaR é a perda que só seria superada em 5% (ou 1%) dos dias, supondo distribuição normal; em cripto as quedas
                extremas são mais frequentes do que isso. Os cenários aplicam a variação do BTC pelo beta de cada ativo.
              </p>
            </div>
          </details>
        </form>

        <div className="panel" aria-live="polite">
          <div className="score">
            <span className="big num">{report?.score ?? 0}</span>
            <span>
              <b>{report ? `Risco ${report.band.toLowerCase()}` : "Adicione um valor"}</b>
              <br />
              <span className="meta">índice de risco, de 0 a 100</span>
            </span>
          </div>
          <div className="gauge"><i style={{ left: `${report?.score ?? 0}%` }} /></div>
          <div className="kv">
            <div><span className="meta">Total</span><span className="v num">{report ? brl(report.totalBrl) : "—"}</span></div>
            <div><span className="meta">Oscilação típica em 1 dia</span><span className="v num">{report ? `± ${brl(report.totalBrl * report.dailyVol)}` : "—"}</span></div>
            <div><span className="meta">Volatilidade anual</span><span className="v num">{report ? pct(report.annualVol) : "—"}</span></div>
            <div><span className="meta">Perda em dia ruim (VaR 95%)</span><span className="v num">{report ? `− ${brl(report.var95DayBrl)}` : "—"}</span></div>
            <div><span className="meta">Perda em dia muito ruim (VaR 99%)</span><span className="v num">{report ? `− ${brl(report.var99DayBrl)}` : "—"}</span></div>
            <div><span className="meta">Média dos 5% piores dias</span><span className="v num">{report ? `− ${brl(report.es95DayBrl)}` : "—"}</span></div>
            <div><span className="meta">Semana ruim (VaR 95%)</span><span className="v num">{report ? `− ${brl(report.var95WeekBrl)}` : "—"}</span></div>
            <div><span className="meta">Mês ruim (VaR 95%)</span><span className="v num">{report ? `− ${brl(report.var95MonthBrl)}` : "—"}</span></div>
            <div><span className="meta">Sensibilidade ao BTC (beta)</span><span className="v num">{report ? report.beta.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "—"}</span></div>
          </div>

          {report && (
            <>
              <div className="tabs" role="tablist" aria-label="Detalhes">
                {TABS.map((t) => (
                  <button key={t.id} type="button" role="tab" className="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === "cenarios" && (
                <div className="tabpanel">
                  <label className="field slider">
                    <span>
                      Se o BTC variar <b className="num">{shock > 0 ? "+" : ""}{shock}%</b>, a carteira iria a{" "}
                      <b className="num">{brl(report.totalBrl + btcShock(report.holdings, shock / 100))}</b>{" "}
                      <span className={`num chg ${tone(btcShock(report.holdings, shock / 100))}`}>({signedBrl(btcShock(report.holdings, shock / 100))})</span>
                    </span>
                    <input type="range" min={-60} max={60} step={1} value={shock} onChange={(e) => setShock(Number(e.target.value))} />
                  </label>
                  <div className="tablewrap">
                    <table>
                      <thead><tr><th>Cenário</th><th className="r">Resultado</th><th className="r">Carteira</th></tr></thead>
                      <tbody>
                        {report.scenarios.map((s) => (
                          <tr key={s.label}>
                            <td>{s.label}</td>
                            <td className={`r num chg ${tone(s.pnlBrl)}`}>{signedBrl(s.pnlBrl)}</td>
                            <td className="r num">{brl(report.totalBrl + s.pnlBrl)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <h3>Se um episódio do passado se repetisse</h3>
                  <div className="tablewrap">
                    <table>
                      <thead><tr><th>Episódio</th><th className="r">Resultado</th><th className="r">Carteira</th></tr></thead>
                      <tbody>
                        {report.historical.map((s) => (
                          <tr key={s.label}>
                            <td className="cell-wrap">
                              {s.label}
                              <span className="meta ep-note">{s.note}</span>
                            </td>
                            <td className={`r num chg ${tone(s.pnlBrl)}`}>{signedBrl(s.pnlBrl)}</td>
                            <td className="r num">{brl(report.totalBrl + s.pnlBrl)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="meta">Simulações com a queda aproximada do BTC em cada episódio. Não indicam o que vai acontecer.</p>
                </div>
              )}

              {tab === "ativos" && (
                <div className="tabpanel tablewrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Ativo</th><th className="r">Valor</th><th className="r">Peso</th><th className="r">Vol. anual</th>
                        <th className="r">Beta</th><th className="r">Parte do risco</th><th className="r">24h</th><th className="r">7d</th>
                        <th className="r">30d</th><th className="r">Da máxima</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.holdings.map((h) => {
                        const p = byTicker[h.ticker];
                        return (
                          <tr key={h.ticker}>
                            <td><b>{h.ticker}</b></td>
                            <td className="r num">{brl(h.valueBrl)}</td>
                            <td className="r num">{pct(h.weight)}</td>
                            <td className="r num">{pct(h.annualVol)}</td>
                            <td className="r num">{h.beta.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</td>
                            <td className="r num">{pct(h.riskShare)}</td>
                            {[p?.change24h, p?.change7d, p?.change30d, p?.athChange].map((v, k) => (
                              <td key={k} className={`r num chg ${tone(v)}`}>{v === undefined ? "—" : signedPct(v)}</td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === "concentracao" && (
                <div className="tabpanel">
                  <div className="kv">
                    <div><span className="meta">Ativos efetivos</span><span className="v num">{report.effectiveN.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</span></div>
                    <div><span className="meta">Ganho da diversificação</span><span className="v num">{pct(report.diversification)}</span></div>
                    <div><span className="meta">Em stablecoins</span><span className="v num">{pct(report.stableShare)}</span></div>
                    <div><span className="meta">Em altcoins</span><span className="v num">{pct(report.altShare)}</span></div>
                  </div>
                  <p className="meta legend"><span className="sw w" /> peso no valor <span className="sw r" /> parte da oscilação</p>
                  <div className="bars">
                    {report.holdings.map((h) => (
                      <div className="bar two" key={h.ticker}>
                        <b>{h.ticker}</b>
                        <span className="tracks">
                          <span className="track"><span className="fill" style={{ width: `${h.weight * 100}%` }} /></span>
                          <span className="track"><span className="fill risk" style={{ width: `${Math.max(0, h.riskShare) * 100}%` }} /></span>
                        </span>
                        <span className="num">{pct(h.weight)}<br />{pct(h.riskShare)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="meta">
                    “Ativos efetivos” diz quantos ativos de mesmo peso dariam a mesma concentração. O ganho da diversificação
                    compara a oscilação da carteira com a soma das oscilações de cada ativo.
                  </p>
                </div>
              )}

              {tab === "atencao" && (
                <div className="tabpanel">
                  <ul className="list">{flags.map((f) => <li key={f}>{f}</li>)}</ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
