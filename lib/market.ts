import { MARKET_SNAPSHOT } from "./sample-data.ts";

export interface Quote {
  ticker: string;
  name: string;
  usd: number;
  brl: number | null;
  change24h: number; // % em 24 h
}

export interface FearGreed {
  value: number;
  label: string;
  previous: number | null;
}

export interface MarketData {
  quotes: Quote[];
  usdBrl: number | null;
  fearGreed: FearGreed | null;
  asOf: string; // ISO 8601
  live: boolean;
}

export const COINS = [
  { id: "bitcoin", ticker: "BTC", name: "Bitcoin" },
  { id: "ethereum", ticker: "ETH", name: "Ethereum" },
  { id: "solana", ticker: "SOL", name: "Solana" },
  { id: "ripple", ticker: "XRP", name: "XRP" },
] as const;

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd,brl&include_24hr_change=true&include_last_updated_at=true&ids=" +
  COINS.map((c) => c.id).join(",");
const FEAR_GREED_URL = "https://api.alternative.me/fng/?limit=2";

type CoinGeckoPrice = { usd?: number; brl?: number; usd_24h_change?: number; last_updated_at?: number };

/** Converte a resposta de /simple/price. Moedas sem preço em dólar ficam de fora. */
export function parseCoinGecko(json: Record<string, CoinGeckoPrice>): { quotes: Quote[]; usdBrl: number | null; asOf: string | null } {
  const quotes: Quote[] = [];
  let latest = 0;
  for (const c of COINS) {
    const p = json[c.id];
    if (typeof p?.usd !== "number") continue;
    quotes.push({
      ticker: c.ticker,
      name: c.name,
      usd: p.usd,
      brl: typeof p.brl === "number" ? p.brl : null,
      change24h: typeof p.usd_24h_change === "number" ? p.usd_24h_change : 0,
    });
    latest = Math.max(latest, p.last_updated_at ?? 0);
  }
  const btc = quotes.find((q) => q.ticker === "BTC");
  const usdBrl = btc?.brl ? btc.brl / btc.usd : null;
  return { quotes, usdBrl, asOf: latest ? new Date(latest * 1000).toISOString() : null };
}

const FNG_LABELS: Record<string, string> = {
  "extreme fear": "Medo extremo",
  fear: "Medo",
  neutral: "Neutro",
  greed: "Ganância",
  "extreme greed": "Ganância extrema",
};

export function parseFearGreed(json: { data?: { value?: string; value_classification?: string }[] }): FearGreed | null {
  const [today, yesterday] = json.data ?? [];
  const value = Number(today?.value);
  if (!today || !Number.isFinite(value)) return null;
  const prev = Number(yesterday?.value);
  return {
    value,
    label: FNG_LABELS[(today.value_classification ?? "").toLowerCase()] ?? today.value_classification ?? "",
    previous: Number.isFinite(prev) ? prev : null,
  };
}

async function getJson(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(6000),
    next: { revalidate: 120 },
  });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

/** Preços e sentimento atuais. Se a API de preços falhar, devolve o retrato do relatório diário com live = false. */
export async function getMarket(): Promise<MarketData> {
  const [prices, fng] = await Promise.allSettled([getJson(COINGECKO_URL), getJson(FEAR_GREED_URL)]);
  const fearGreed = fng.status === "fulfilled" ? parseFearGreed(fng.value) : null;
  if (prices.status === "fulfilled") {
    const parsed = parseCoinGecko(prices.value);
    if (parsed.quotes.length) {
      return { quotes: parsed.quotes, usdBrl: parsed.usdBrl, fearGreed, asOf: parsed.asOf ?? new Date().toISOString(), live: true };
    }
  }
  return {
    quotes: MARKET_SNAPSHOT.quotes,
    usdBrl: null,
    fearGreed: fearGreed ?? MARKET_SNAPSHOT.fearGreed,
    asOf: MARKET_SNAPSHOT.asOf,
    live: false,
  };
}
