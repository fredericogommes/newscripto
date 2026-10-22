"use client";

import type { AssetProfile, MarketEvent, Position } from "@/lib/types.ts";
import type { RiskReport } from "@/lib/risk.ts";
import { brl, pct, relative } from "./format.ts";

export default function RiskCalculator({
  positions,
  profiles,
  report,
  upcoming,
  now,
  onChange,
  onReset,
}: {
  positions: Position[];
  profiles: AssetProfile[];
  report: RiskReport | null;
  upcoming: MarketEvent[];
  now: number;
  onChange: (next: Position[]) => void;
  onReset: () => void;
}) {
  const set = (i: number, patch: Partial<Position>) =>
    onChange(positions.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  const flags: string[] = [];
  if (report) {
    const top = report.holdings[0];
    if (top.weight > 0.6) flags.push(`${pct(top.weight)} da carteira está em ${top.ticker}. Um evento nesse ativo mexe com quase tudo.`);
    const stable = new Set(profiles.filter((p) => p.isStable).map((p) => p.ticker));
    const alt = report.holdings.filter((h) => !stable.has(h.ticker) && h.ticker !== "BTC").reduce((s, h) => s + h.weight, 0);
    if (alt > 0.4) flags.push(`${pct(alt)} em altcoins, que historicamente caem mais que o BTC nas quedas (beta acima de 1).`);
    for (const e of upcoming) flags.push(`${e.title}, ${relative(Date.parse(e.startsAt), now)}: ${e.biasLabel.toLowerCase()}.`);
    if (!flags.length) flags.push("Nenhum ponto de atenção para os próximos 14 dias.");
  }

  return (
    <section className="section" id="risco">
      <div className="section-head">
        <p className="eyebrow">Calculadora de risco</p>
        <h2>Quanto sua carteira pode oscilar</h2>
        <p className="meta">Os valores abaixo são um exemplo. Troque pelas suas posições em reais; elas ficam salvas só neste navegador.</p>
      </div>
      <div className="calc">
        <form className="panel" onSubmit={(e) => e.preventDefault()}>
          <h3>Suas posições (R$)</h3>
          <div className="rows">
            {positions.map((p, i) => (
              <div className="row" key={i}>
                <select id={`ativo-${i}`} aria-label="Ativo" value={p.ticker} onChange={(e) => set(i, { ticker: e.target.value })}>
                  {profiles.map((a) => (
                    <option key={a.ticker}>{a.ticker}</option>
                  ))}
                </select>
                <input
                  id={`valor-${i}`}
                  type="number"
                  min={0}
                  step={100}
                  inputMode="decimal"
                  aria-label="Valor em reais"
                  value={p.valueBrl}
                  onChange={(e) => set(i, { valueBrl: Math.max(0, Number(e.target.value) || 0) })}
                />
                <button type="button" className="x" aria-label="Remover" onClick={() => onChange(positions.filter((_, j) => j !== i))}>
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => onChange([...positions, { ticker: "ETH", valueBrl: 5000 }])}>
              Adicionar ativo
            </button>
            <button type="button" className="btn ghost" onClick={onReset}>
              Voltar ao exemplo
            </button>
          </div>
          <details>
            <summary className="meta">Premissas do cálculo</summary>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr><th>Ativo</th><th className="r">Vol. anual</th><th className="r">Beta vs BTC</th></tr>
                </thead>
                <tbody>
                  {profiles.map((a) => (
                    <tr key={a.ticker}>
                      <td>{a.ticker}</td>
                      <td className="r num">{pct(a.annualVol)}</td>
                      <td className="r num">{a.betaBtc.toLocaleString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="meta">Volatilidades de referência, aproximadas. Correlação de 0,75 entre criptos e zero para stablecoins. VaR paramétrico com 95% de confiança.</p>
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
            <div><span className="meta">Perda em dia ruim (VaR 95%)</span><span className="v num">{report ? `− ${brl(report.var95DayBrl)}` : "—"}</span></div>
            <div><span className="meta">Perda em semana ruim (VaR 95%)</span><span className="v num">{report ? `− ${brl(report.var95WeekBrl)}` : "—"}</span></div>
          </div>
          {report && (
            <>
              <h3>Se o BTC cair…</h3>
              <div className="tablewrap">
                <table>
                  <thead><tr><th>Cenário</th><th className="r">Impacto estimado</th><th className="r">Carteira</th></tr></thead>
                  <tbody>
                    {report.btcStress.map((s) => (
                      <tr key={s.drawdown}>
                        <td>BTC {pct(s.drawdown)}</td>
                        <td className="r num" style={{ color: "var(--down)" }}>{brl(s.lossBrl)}</td>
                        <td className="r num">{brl(report.totalBrl + s.lossBrl)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3>Concentração</h3>
              <div className="bars">
                {report.holdings.map((h) => (
                  <div className="bar" key={h.ticker}>
                    <b>{h.ticker}</b>
                    <span className="track"><span className="fill" style={{ width: `${h.weight * 100}%` }} /></span>
                    <span className="num">{pct(h.weight)}</span>
                  </div>
                ))}
              </div>
              <h3>Pontos de atenção</h3>
              <ul className="list">{flags.map((f) => <li key={f}>{f}</li>)}</ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
