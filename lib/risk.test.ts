import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzePortfolio, eventTouches } from "./risk.ts";
import { SAMPLE_PROFILES, SAMPLE_EVENTS } from "./sample-data.ts";

const profiles = Object.fromEntries(SAMPLE_PROFILES.map((p) => [p.ticker, p]));

test("carteira só de BTC tem a volatilidade do BTC", () => {
  const r = analyzePortfolio([{ ticker: "BTC", valueBrl: 10000 }], profiles)!;
  assert.ok(Math.abs(r.annualVol - 0.45) < 1e-9);
  assert.equal(r.score, 56); // 45 * 0.8 + 1 * 20
  assert.equal(r.band, "Elevado");
});

test("exemplo do Fred: R$ 15 mil em BTC e R$ 10 mil em SOL", () => {
  const r = analyzePortfolio(
    [{ ticker: "BTC", valueBrl: 15000 }, { ticker: "SOL", valueBrl: 10000 }],
    profiles,
  )!;
  assert.equal(r.totalBrl, 25000);
  assert.equal(r.holdings[0].ticker, "BTC");
  // BTC -20% com beta 1,5 na SOL: 15000*-0.2 + 10000*-0.3
  assert.equal(Math.round(r.btcStress[1].lossBrl), -6000);
  assert.ok(r.var95WeekBrl > r.var95DayBrl);
});

test("stablecoin reduz o risco e não sofre no cenário de queda", () => {
  const r = analyzePortfolio(
    [{ ticker: "BTC", valueBrl: 5000 }, { ticker: "USDT", valueBrl: 5000 }],
    profiles,
  )!;
  assert.ok(r.annualVol < 0.45);
  assert.equal(Math.round(r.btcStress[0].lossBrl), -500);
});

test("carteira vazia não gera relatório", () => {
  assert.equal(analyzePortfolio([{ ticker: "BTC", valueBrl: 0 }], profiles), null);
});

test("eventos de mercado inteiro ignoram carteira só de stablecoin", () => {
  const fed = SAMPLE_EVENTS.find((e) => e.slug === "fomc-2026-10-28")!;
  assert.equal(eventTouches(fed, ["USDT"], profiles), false);
  assert.equal(eventTouches(fed, ["USDT", "SOL"], profiles), true);
});
