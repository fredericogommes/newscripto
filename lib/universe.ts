import type { AssetProfile } from "./types.ts";
import { EXCHANGES, getListings, type Exchange } from "./exchanges.ts";

const MARKETS_URL = (page: number, sparkline: boolean) =>
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=250&page=${page}` +
  `&sparkline=${sparkline}&price_change_percentage=24h,7d,30d`;

const STABLES = new Set([
  "USDT", "USDC", "DAI", "FDUSD", "TUSD", "USDE", "PYUSD", "USDS", "USD1", "USDD", "FRAX", "GUSD", "USDP", "RLUSD",
  "LUSD", "CRVUSD", "USDB", "USDX", "BUSD", "EURC", "EURT", "BRZ", "BRLA", "USDG", "USR", "USD0", "GHO", "SUSDE", "SUSDS",
]);

export interface CoinRow {
  id: string;
  ticker: string;
  name: string;
  image?: string;
  rank: number;
  priceBrl: number;
  change24h?: number;
  change7d?: number;
  change30d?: number;
  athChange?: number;
  spark?: number[];
}

type GeckoMarket = {
  id?: string;
  symbol?: string;
  name?: string;
  image?: string;
  market_cap_rank?: number | null;
  current_price?: number | null;
  price_change_percentage_24h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
  price_change_percentage_30d_in_currency?: number | null;
  ath_change_percentage?: number | null;
  sparkline_in_7d?: { price?: number[] };
};

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

/** Converte /coins/markets. Moedas sem preço ou sem posição no ranking ficam de fora. */
export function parseMarkets(json: unknown): CoinRow[] {
  if (!Array.isArray(json)) return [];
  const rows: CoinRow[] = [];
  for (const m of json as GeckoMarket[]) {
    const price = num(m?.current_price);
    const rank = num(m?.market_cap_rank);
    if (!m?.id || !m.symbol || !m.name || !price || !rank) continue;
    rows.push({
      id: m.id,
      ticker: m.symbol.toUpperCase(),
      name: m.name,
      image: m.image?.replace("/large/", "/thumb/"),
      rank,
      priceBrl: price,
      change24h: num(m.price_change_percentage_24h_in_currency),
      change7d: num(m.price_change_percentage_7d_in_currency),
      change30d: num(m.price_change_percentage_30d_in_currency),
      athChange: num(m.ath_change_percentage),
      spark: m.sparkline_in_7d?.price?.filter((p) => p > 0),
    });
  }
  return rows;
}

const logReturns = (p: number[]) => p.slice(1).map((v, i) => Math.log(v / p[i]));
const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;

/** Volatilidade anual e beta contra o BTC a partir dos preços horários de 7 dias. */
export function realizedStats(spark: number[], btcSpark: number[]): { vol: number; beta: number } | null {
  const n = Math.min(spark.length, btcSpark.length);
  if (n < 48) return null;
  const a = logReturns(spark.slice(-n));
  const b = logReturns(btcSpark.slice(-n));
  const ma = mean(a);
  const mb = mean(b);
  let va = 0;
  let vb = 0;
  let cov = 0;
  for (let i = 0; i < a.length; i++) {
    va += (a[i] - ma) ** 2;
    vb += (b[i] - mb) ** 2;
    cov += (a[i] - ma) * (b[i] - mb);
  }
  const vol = Math.sqrt(va / (a.length - 1)) * Math.sqrt(24 * 365);
  return { vol, beta: vb > 0 ? cov / vb : 1 };
}

// Referência por tamanho: 7 dias é pouco, então a medida é misturada com estes valores.
const priorVol = (rank: number) => (rank <= 10 ? 0.65 : rank <= 50 ? 0.85 : rank <= 200 ? 1.0 : 1.2);
const priorBeta = (rank: number) => (rank <= 10 ? 1.2 : rank <= 50 ? 1.4 : 1.5);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function buildProfiles(
  rows: CoinRow[],
  listings: Partial<Record<Exchange, Set<string>>>,
  keepTopRank = 100,
): AssetProfile[] {
  const btc = rows.find((r) => r.id === "bitcoin");
  const seen = new Set<string>();
  const out: AssetProfile[] = [];
  for (const r of [...rows].sort((a, b) => a.rank - b.rank)) {
    if (seen.has(r.ticker)) continue; // símbolo repetido: fica a moeda maior
    const exchanges = EXCHANGES.filter((e) => listings[e]?.has(r.ticker));
    if (exchanges.length === 0 && r.rank > keepTopRank) continue;
    seen.add(r.ticker);

    const isStable = STABLES.has(r.ticker);
    let annualVol = isStable ? 0.02 : priorVol(r.rank);
    let betaBtc = isStable ? 0 : r.id === "bitcoin" ? 1 : priorBeta(r.rank);
    let measured = false;
    if (!isStable && r.spark && btc?.spark) {
      const s = realizedStats(r.spark, btc.spark);
      if (s) {
        measured = true;
        annualVol = clamp(0.6 * s.vol + 0.4 * (r.id === "bitcoin" ? 0.45 : priorVol(r.rank)), 0.2, 3);
        if (r.id !== "bitcoin") betaBtc = clamp(0.6 * s.beta + 0.4 * priorBeta(r.rank), 0, 3);
      }
    }
    out.push({
      ticker: r.ticker,
      name: r.name,
      annualVol: Math.round(annualVol * 1000) / 1000,
      betaBtc: Math.round(betaBtc * 100) / 100,
      isStable,
      rank: r.rank,
      image: r.image,
      priceBrl: r.priceBrl,
      change24h: r.change24h,
      change7d: r.change7d,
      change30d: r.change30d,
      athChange: r.athChange,
      exchanges,
      measured,
    });
  }
  return out;
}

export interface Universe {
  profiles: AssetProfile[];
  exchanges: string[]; // corretoras que responderam
  asOf: string;
}

async function markets(page: number, sparkline: boolean): Promise<CoinRow[]> {
  const res = await fetch(MARKETS_URL(page, sparkline), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`CoinGecko markets p${page}: HTTP ${res.status}`);
  return parseMarkets(await res.json());
}

/**
 * Até 1.000 maiores moedas da CoinGecko, mantidas as que estão em pelo menos uma das grandes corretoras
 * (e as 100 maiores mesmo sem corretora identificada). Devolve null se a CoinGecko não responder.
 */
export async function getUniverse(): Promise<Universe | null> {
  const [pages, listings] = await Promise.all([
    Promise.allSettled([markets(1, true), markets(2, true), markets(3, false), markets(4, false)]),
    getListings(),
  ]);
  const rows = pages.flatMap((p) => (p.status === "fulfilled" ? p.value : []));
  if (!rows.some((r) => r.id === "bitcoin")) return null;
  return {
    profiles: buildProfiles(rows, listings),
    exchanges: EXCHANGES.filter((e) => listings[e]),
    asOf: new Date().toISOString(),
  };
}
