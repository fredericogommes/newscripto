import type { AssetProfile, MarketEvent, Position } from "./types.ts";

/** z unicaudal para VaR paramétrico. */
export const Z95 = 1.645;
export const Z99 = 2.326;
/** Perda média além do VaR (expected shortfall) em múltiplos do desvio, sob normal. */
const ES95 = 2.063;
const ES99 = 2.665;

export type RiskBand = "Baixo" | "Moderado" | "Elevado" | "Alto";

export interface Holding {
  ticker: string;
  valueBrl: number;
  weight: number;
  annualVol: number;
  dailyVol: number;
  beta: number;
  /** Parte do risco total da carteira que vem deste ativo (soma 1). */
  riskShare: number;
  /** VaR 95% de 1 dia do ativo sozinho, em R$. */
  var95DayBrl: number;
}

export interface Scenario {
  label: string;
  btcMove: number;
  pnlBrl: number;
  note?: string;
}

export interface RiskReport {
  holdings: Holding[];
  totalBrl: number;
  dailyVol: number;
  annualVol: number;
  hhi: number;
  effectiveN: number;
  stableShare: number;
  altShare: number;
  beta: number;
  /** Quanto a diversificação reduz a oscilação frente à soma das partes (0 a 1). */
  diversification: number;
  score: number;
  band: RiskBand;
  var95DayBrl: number;
  var95WeekBrl: number;
  var95MonthBrl: number;
  var99DayBrl: number;
  es95DayBrl: number;
  es99DayBrl: number;
  btcStress: { drawdown: number; lossBrl: number }[];
  scenarios: Scenario[];
  historical: Scenario[];
}

/** Episódios reais de queda do BTC, aplicados à carteira pelo beta de cada ativo. Valores aproximados. */
export const HISTORICAL = [
  { label: "Covid, 12/03/2020", btcMove: -0.39, note: "BTC caiu cerca de 39% em um dia" },
  { label: "Terra/LUNA, maio de 2022", btcMove: -0.27, note: "BTC caiu cerca de 27% em uma semana" },
  { label: "Quebra da FTX, novembro de 2022", btcMove: -0.25, note: "BTC caiu cerca de 25% em uma semana" },
  { label: "Liquidações de 10/10/2025", btcMove: -0.14, note: "BTC caiu cerca de 14% em horas; altcoins caíram bem mais" },
];

export function riskBand(score: number): RiskBand {
  return score < 35 ? "Baixo" : score < 55 ? "Moderado" : score < 75 ? "Elevado" : "Alto";
}

/** Resultado em R$ se o BTC variar `move`, pelo beta de cada ativo. Nenhum ativo perde mais que 100%. */
export function btcShock(holdings: { valueBrl: number; beta: number }[], move: number): number {
  return holdings.reduce((s, h) => s + h.valueBrl * Math.max(-1, move * h.beta), 0);
}

/**
 * Modelo de um fator: cada cripto tem uma parte do risco que acompanha o BTC (beta × vol do BTC) e uma parte
 * própria, independente das outras. Stablecoins não acompanham o BTC.
 */
export function analyzePortfolio(
  positions: Position[],
  profiles: Record<string, AssetProfile>,
): RiskReport | null {
  const merged = new Map<string, number>();
  for (const p of positions) {
    if (p.valueBrl > 0 && profiles[p.ticker]) merged.set(p.ticker, (merged.get(p.ticker) ?? 0) + p.valueBrl);
  }
  const totalBrl = [...merged.values()].reduce((s, v) => s + v, 0);
  if (!totalBrl) return null;

  const btcVol = profiles.BTC?.annualVol ?? 0.45;
  const assets = [...merged].map(([ticker, valueBrl]) => {
    const p = profiles[ticker];
    const vol = p.annualVol;
    const beta = p.isStable ? 0 : p.betaBtc;
    const sys = Math.min(vol, beta * btcVol); // parte ligada ao BTC
    return { ticker, valueBrl, weight: valueBrl / totalBrl, vol, beta, sys, stable: p.isStable };
  });

  // Σw: covariância de cada ativo com a carteira (anual).
  const covWithPortfolio = assets.map((a) =>
    assets.reduce((s, b) => s + b.weight * (a === b ? a.vol ** 2 : a.sys * b.sys), 0),
  );
  const variance = assets.reduce((s, a, i) => s + a.weight * covWithPortfolio[i], 0);
  const annualVol = Math.sqrt(variance);
  const dailyVol = annualVol / Math.sqrt(365);
  const day = (z: number) => totalBrl * dailyVol * z;

  const holdings: Holding[] = assets.map((a, i) => ({
    ticker: a.ticker,
    valueBrl: a.valueBrl,
    weight: a.weight,
    annualVol: a.vol,
    dailyVol: a.vol / Math.sqrt(365),
    beta: a.beta,
    riskShare: variance > 0 ? (a.weight * covWithPortfolio[i]) / variance : 0,
    var95DayBrl: (a.valueBrl * a.vol * Z95) / Math.sqrt(365),
  }));

  const hhi = holdings.reduce((s, h) => s + h.weight ** 2, 0);
  const standalone = assets.reduce((s, a) => s + a.weight * a.vol, 0);
  const score = Math.min(100, Math.round(annualVol * 100 * 0.8 + hhi * 20));

  return {
    holdings: holdings.sort((a, b) => b.weight - a.weight),
    totalBrl,
    dailyVol,
    annualVol,
    hhi,
    effectiveN: 1 / hhi,
    stableShare: assets.filter((a) => a.stable).reduce((s, a) => s + a.weight, 0),
    altShare: assets.filter((a) => !a.stable && a.ticker !== "BTC").reduce((s, a) => s + a.weight, 0),
    beta: assets.reduce((s, a) => s + a.weight * a.beta, 0),
    diversification: standalone > 0 ? Math.max(0, 1 - annualVol / standalone) : 0,
    score,
    band: riskBand(score),
    var95DayBrl: day(Z95),
    var95WeekBrl: day(Z95) * Math.sqrt(7),
    var95MonthBrl: day(Z95) * Math.sqrt(30),
    var99DayBrl: day(Z99),
    es95DayBrl: day(ES95),
    es99DayBrl: day(ES99),
    btcStress: [-0.1, -0.2, -0.3].map((drawdown) => ({ drawdown, lossBrl: btcShock(holdings, drawdown) })),
    scenarios: [-0.5, -0.3, -0.2, -0.1, 0.1, 0.2, 0.3].map((m) => ({
      label: `BTC ${m > 0 ? "+" : "−"}${Math.abs(m * 100)}%`,
      btcMove: m,
      pnlBrl: btcShock(holdings, m),
    })),
    historical: HISTORICAL.map((h) => ({ ...h, pnlBrl: btcShock(holdings, h.btcMove) })),
  };
}

/** Se o evento afeta algum ativo da carteira. Eventos "*" valem para quem tem cripto fora de stablecoin. */
export function eventTouches(
  event: MarketEvent,
  tickers: Iterable<string>,
  profiles: Record<string, AssetProfile>,
): boolean {
  const held = [...tickers];
  if (event.assets.includes("*")) return held.some((t) => !profiles[t]?.isStable);
  return event.assets.some((a) => held.includes(a));
}
