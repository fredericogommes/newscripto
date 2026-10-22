import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCoinGecko, parseFearGreed } from "./market.ts";

test("parseCoinGecko lê preços em US$ e R$ e calcula o câmbio pelo BTC", () => {
  const r = parseCoinGecko({
    bitcoin: { usd: 80000, brl: 440000, usd_24h_change: -1.234, last_updated_at: 1792700000 },
    solana: { usd: 100, brl: 550, usd_24h_change: 2 },
    ripple: { brl: 7 }, // sem preço em dólar: fica de fora
  });
  assert.deepEqual(r.quotes.map((q) => q.ticker), ["BTC", "SOL"]);
  assert.equal(r.usdBrl, 5.5);
  assert.equal(r.quotes[0].change24h, -1.234);
  assert.equal(r.asOf, new Date(1792700000 * 1000).toISOString());
});

test("parseCoinGecko sem BTC não inventa câmbio", () => {
  const r = parseCoinGecko({ ethereum: { usd: 2400 } });
  assert.equal(r.usdBrl, null);
  assert.equal(r.quotes[0].brl, null);
});

test("parseFearGreed traduz a faixa e guarda o dia anterior", () => {
  const r = parseFearGreed({ data: [{ value: "72", value_classification: "Greed" }, { value: "65", value_classification: "Greed" }] });
  assert.deepEqual(r, { value: 72, label: "Ganância", previous: 65 });
  assert.equal(parseFearGreed({ data: [] }), null);
});
