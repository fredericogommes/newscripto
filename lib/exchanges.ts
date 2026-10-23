// Moedas negociadas à vista nas principais corretoras, lidas das APIs públicas de cada uma.
// Uma corretora que falha (fora do ar, bloqueio por região) só fica de fora da lista.

export const EXCHANGES = ["Binance", "Coinbase", "Kraken", "OKX", "Bybit", "KuCoin", "Mercado Bitcoin"] as const;
export type Exchange = (typeof EXCHANGES)[number];

const ALIASES: Record<string, string> = { XBT: "BTC", XDG: "DOGE" };
const norm = (s: string) => {
  const t = s.trim().toUpperCase();
  return ALIASES[t] ?? t;
};

// Moedas de cotação da Binance, da mais longa para a mais curta para "FDUSD" não virar "FD" + "USD".
const BINANCE_QUOTES = [
  "FDUSD", "USDT", "USDC", "TUSD", "BUSD", "USD1", "AEUR", "EURI", "BIDR", "BRL", "TRY", "EUR", "BTC", "ETH", "BNB",
  "DAI", "JPY", "MXN", "ARS", "ZAR", "PLN", "RON", "UAH", "IDR", "COP", "CZK", "GBP", "AUD", "PAX", "XRP", "DOGE", "SOL",
].sort((a, b) => b.length - a.length);

export function parseBinance(json: unknown): string[] {
  if (!Array.isArray(json)) return [];
  const out: string[] = [];
  for (const row of json as { symbol?: string }[]) {
    const s = row?.symbol;
    if (typeof s !== "string") continue;
    const q = BINANCE_QUOTES.find((q) => s.endsWith(q) && s.length > q.length);
    if (q) out.push(norm(s.slice(0, -q.length)));
  }
  return out;
}

export function parseCoinbase(json: unknown): string[] {
  if (!Array.isArray(json)) return [];
  return (json as { base_currency?: string; status?: string; trading_disabled?: boolean }[])
    .filter((p) => typeof p?.base_currency === "string" && p.status !== "delisted" && !p.trading_disabled)
    .map((p) => norm(p.base_currency!));
}

export function parseKraken(json: unknown): string[] {
  const result = (json as { result?: Record<string, { wsname?: string; status?: string }> })?.result;
  if (!result) return [];
  return Object.values(result)
    .filter((p) => typeof p?.wsname === "string" && (p.status ?? "online") === "online")
    .map((p) => norm(p.wsname!.split("/")[0]));
}

export function parseOkx(json: unknown): string[] {
  const data = (json as { data?: { baseCcy?: string; state?: string }[] })?.data;
  if (!Array.isArray(data)) return [];
  return data.filter((p) => typeof p?.baseCcy === "string" && p.state === "live").map((p) => norm(p.baseCcy!));
}

export function parseBybit(json: unknown): string[] {
  const list = (json as { result?: { list?: { baseCoin?: string; status?: string }[] } })?.result?.list;
  if (!Array.isArray(list)) return [];
  return list.filter((p) => typeof p?.baseCoin === "string" && p.status === "Trading").map((p) => norm(p.baseCoin!));
}

export function parseKucoin(json: unknown): string[] {
  const data = (json as { data?: { baseCurrency?: string; enableTrading?: boolean }[] })?.data;
  if (!Array.isArray(data)) return [];
  return data.filter((p) => typeof p?.baseCurrency === "string" && p.enableTrading).map((p) => norm(p.baseCurrency!));
}

export function parseMercadoBitcoin(json: unknown): string[] {
  const symbols = (json as { symbol?: string[] })?.symbol;
  if (!Array.isArray(symbols)) return [];
  return symbols.filter((s) => typeof s === "string" && s.includes("-")).map((s) => norm(s.split("-")[0]));
}

const SOURCES: { exchange: Exchange; url: string; parse: (json: unknown) => string[] }[] = [
  { exchange: "Binance", url: "https://data-api.binance.vision/api/v3/ticker/price", parse: parseBinance },
  { exchange: "Coinbase", url: "https://api.exchange.coinbase.com/products", parse: parseCoinbase },
  { exchange: "Kraken", url: "https://api.kraken.com/0/public/AssetPairs", parse: parseKraken },
  { exchange: "OKX", url: "https://www.okx.com/api/v5/public/instruments?instType=SPOT", parse: parseOkx },
  { exchange: "Bybit", url: "https://api.bybit.com/v5/market/instruments-info?category=spot", parse: parseBybit },
  { exchange: "KuCoin", url: "https://api.kucoin.com/api/v2/symbols", parse: parseKucoin },
  { exchange: "Mercado Bitcoin", url: "https://api.mercadobitcoin.net/api/v4/symbols", parse: parseMercadoBitcoin },
];

/** Para cada corretora que respondeu, o conjunto de tickers negociados. */
export async function getListings(): Promise<Partial<Record<Exchange, Set<string>>>> {
  const results = await Promise.allSettled(
    SOURCES.map(async (s) => {
      const res = await fetch(s.url, {
        headers: { "User-Agent": "JornalCripto/0.1 (+calculadora de risco)", Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 21600 },
      });
      if (!res.ok) throw new Error(`${s.exchange}: HTTP ${res.status}`);
      const tickers = s.parse(await res.json());
      if (tickers.length < 5) throw new Error(`${s.exchange}: lista vazia`);
      return [s.exchange, new Set(tickers)] as const;
    }),
  );
  return Object.fromEntries(results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : [])));
}
