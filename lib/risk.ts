import type { AssetProfile, MarketEvent, Position } from "./types.ts";

/** Correlação assumida entre criptos que não são stablecoins. */
export const CRYPTO_CORRELATION = 0.75;
/** z de 95% para VaR paramétrico unicaudal. */
export const Z95 = 1.645;

export type RiskBand = "Baixo" | "Moderado" | "Elevado" | "Alto";

export interface Holding {
  ticker: string;
  valueBrl: number;
  weight: number;
  dailyVol: number;
}

export interface RiskReport {
  holdings: Holding[];
  totalBrl: number;
  dailyVol: number;
  annualVol: number;
  hhi: number;
  score: number;
  band: RiskBand;
  var95DayBrl: number;
  var95WeekBrl: number;
  btcStress: { drawdown: number; lossBrl: number }[];
}

export function riskBand(score: number): RiskBand {
  return score < 35 ? "Baixo" : score < 55 ? "Moderado" : score < 75 ? "Elevado" : "Alto";
}

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

  const holdings: Holding[] = [...merged].map(([ticker, valueBrl]) => ({
    ticker,
    valueBrl,
    weight: valueBrl / totalBrl,
    dailyVol: profiles[ticker].annualVol / Math.sqrt(365),
  }));

  let variance = 0;
  for (const a of holdings) {
    for (const b of holdings) {
      const stable = profiles[a.ticker].isStable || profiles[b.ticker].isStable;
      const rho = a === b ? 1 : stable ? 0 : CRYPTO_CORRELATION;
      variance += a.weight * b.weight * a.dailyVol * b.dailyVol * rho;
    }
  }
  const dailyVol = Math.sqrt(variance);
  const annualVol = dailyVol * Math.sqrt(365);
  const hhi = holdings.reduce((s, h) => s + h.weight ** 2, 0);
  const score = Math.min(100, Math.round(annualVol * 100 * 0.8 + hhi * 20));

  return {
    holdings: holdings.sort((a, b) => b.weight - a.weight),
    totalBrl,
    dailyVol,
    annualVol,
    hhi,
    score,
    band: riskBand(score),
    var95DayBrl: totalBrl * dailyVol * Z95,
    var95WeekBrl: totalBrl * dailyVol * Z95 * Math.sqrt(7),
    btcStress: [-0.1, -0.2, -0.3].map((drawdown) => ({
      drawdown,
      lossBrl: holdings.reduce(
        (s, h) => s + h.valueBrl * Math.max(-1, drawdown * profiles[h.ticker].betaBtc),
        0,
      ),
    })),
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
