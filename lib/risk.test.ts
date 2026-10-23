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

test("contribuição ao risco soma 100% e diversificação reduz a oscilação", () => {
  const r = analyzePortfolio(
    [{ ticker: "BTC", valueBrl: 10000 }, { ticker: "SOL", valueBrl: 10000 }, { ticker: "USDT", valueBrl: 5000 }],
    profiles,
  )!;
  const sum = r.holdings.reduce((s, h) => s + h.riskShare, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
  assert.ok(r.diversification > 0);
  assert.ok(r.effectiveN > 2 && r.effectiveN < 3);
  assert.equal(r.stableShare, 0.2);
  assert.ok(r.es95DayBrl > r.var95DayBrl && r.var99DayBrl > r.var95DayBrl);
  assert.equal(r.historical.length, 4);
});

test("cenário de alta usa o beta e nenhum ativo perde mais que tudo", () => {
  const r = analyzePortfolio([{ ticker: "SOL", valueBrl: 1000 }], profiles)!;
  assert.equal(Math.round(r.scenarios.find((s) => s.btcMove === 0.2)!.pnlBrl), 300);
  assert.equal(Math.round(r.scenarios.find((s) => s.btcMove === -0.5)!.pnlBrl), -750);
});
