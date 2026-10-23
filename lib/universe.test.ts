import { test } from "node:test";
import assert from "node:assert/strict";
import { buildProfiles, parseMarkets, realizedStats } from "./universe.ts";
import { parseBinance, parseKraken, parseMercadoBitcoin, parseOkx } from "./exchanges.ts";

// Série horária sintética: BTC oscila; ALT faz o dobro do movimento do BTC.
const btc = Array.from({ length: 169 }, (_, i) => 500000 * Math.exp(0.004 * Math.sin(i * 1.3)));
const alt = btc.map((p) => (p / 500000) ** 2 * 10);

test("beta e volatilidade medidos nos preços horários", () => {
  const s = realizedStats(alt, btc)!;
  assert.ok(Math.abs(s.beta - 2) < 1e-6);
  const b = realizedStats(btc, btc)!;
  assert.ok(Math.abs(s.vol - 2 * b.vol) < 1e-6);
  assert.equal(realizedStats(btc.slice(0, 10), btc), null);
});

test("parseMarkets lê a CoinGecko e descarta linhas sem preço", () => {
  const rows = parseMarkets([
    { id: "bitcoin", symbol: "btc", name: "Bitcoin", market_cap_rank: 1, current_price: 450000, image: "https://x/large/btc.png", price_change_percentage_7d_in_currency: -2.5, sparkline_in_7d: { price: btc } },
    { id: "lixo", symbol: "lx", name: "Lixo", market_cap_rank: null, current_price: 1 },
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].ticker, "BTC");
  assert.equal(rows[0].image, "https://x/thumb/btc.png");
  assert.equal(rows[0].change7d, -2.5);
});

test("universo fica com as moedas listadas em corretoras e marca stablecoins", () => {
  const rows = parseMarkets([
    { id: "bitcoin", symbol: "btc", name: "Bitcoin", market_cap_rank: 1, current_price: 450000, sparkline_in_7d: { price: btc } },
    { id: "alt", symbol: "alt", name: "Alt", market_cap_rank: 40, current_price: 10, sparkline_in_7d: { price: alt } },
    { id: "tether", symbol: "usdt", name: "Tether", market_cap_rank: 3, current_price: 5.4 },
    { id: "obscura", symbol: "obs", name: "Obscura", market_cap_rank: 700, current_price: 0.1 },
    { id: "falsa", symbol: "alt", name: "Alt falsa", market_cap_rank: 900, current_price: 0.01 },
  ]);
  const p = buildProfiles(rows, { Binance: new Set(["BTC", "ALT", "USDT"]), "Mercado Bitcoin": new Set(["BTC"]) });
  assert.deepEqual(p.map((x) => x.ticker), ["BTC", "USDT", "ALT"]);
  assert.deepEqual(p[0].exchanges, ["Binance", "Mercado Bitcoin"]);
  assert.equal(p[0].betaBtc, 1);
  assert.equal(p[1].isStable, true);
  assert.equal(p[1].betaBtc, 0);
  assert.ok(p[2].measured && p[2].betaBtc > 1.5 && p[2].betaBtc < 2);
});

test("parsers das corretoras", () => {
  assert.deepEqual(parseBinance([{ symbol: "BTCUSDT" }, { symbol: "ETHBTC" }, { symbol: "SOLFDUSD" }, { symbol: "PEPEBRL" }]), ["BTC", "ETH", "SOL", "PEPE"]);
  assert.deepEqual(parseKraken({ result: { XXBTZUSD: { wsname: "XBT/USD" }, XDGUSD: { wsname: "XDG/USD", status: "online" }, X: { wsname: "ABC/EUR", status: "delisted" } } }), ["BTC", "DOGE"]);
  assert.deepEqual(parseOkx({ data: [{ baseCcy: "OKB", state: "live" }, { baseCcy: "OLD", state: "suspend" }] }), ["OKB"]);
  assert.deepEqual(parseMercadoBitcoin({ symbol: ["BTC-BRL", "USDC-BRL"] }), ["BTC", "USDC"]);
});
