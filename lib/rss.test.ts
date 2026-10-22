import { test } from "node:test";
import assert from "node:assert/strict";
import { detectTickers, mergeNews, parseFeed } from "./rss.ts";

const RSS = `<?xml version="1.0"?><rss><channel><title>Feed</title>
<item><title><![CDATA[Bitcoin e Solana sobem após decisão do Fed]]></title>
<link>https://exemplo.com/a</link><pubDate>Thu, 22 Oct 2026 12:00:00 +0000</pubDate></item>
<item><title>ETFs de Ether t&#234;m sa&iacute;da &amp; entrada &Ccedil;&atilde;o</title>
<link>https://exemplo.com/b</link><pubDate>Thu, 22 Oct 2026 13:30:00 +0000</pubDate></item>
<item><title>Sem data</title><link>https://exemplo.com/c</link></item>
</channel></rss>`;

const ATOM = `<feed><entry><title type="html">XRP Ledger corrige protocolo</title>
<link rel="alternate" href="https://exemplo.org/x"/><updated>2026-10-21T09:00:00Z</updated></entry></feed>`;

test("lê RSS 2.0 com CDATA e entidades, e descarta item sem data", () => {
  const items = parseFeed(RSS, { name: "Teste", region: "Brasil" });
  assert.equal(items.length, 2);
  assert.equal(items[0].title, "Bitcoin e Solana sobem após decisão do Fed");
  assert.deepEqual(items[0].tickers, ["BTC", "SOL"]);
  assert.equal(items[1].title, "ETFs de Ether têm saída & entrada Ção");
  assert.deepEqual(items[1].tickers, ["ETH"]);
});

test("lê Atom com link em atributo", () => {
  const [item] = parseFeed(ATOM, { name: "Atom", region: "Global" });
  assert.equal(item.link, "https://exemplo.org/x");
  assert.equal(item.publishedAt, "2026-10-21T09:00:00.000Z");
  assert.deepEqual(item.tickers, ["XRP"]);
});

test("não confunde palavras que só contêm o ticker", () => {
  assert.deepEqual(detectTickers("Solução de pagamentos e console novo"), []);
});

test("mergeNews ordena do mais novo e remove repetidos", () => {
  const a = parseFeed(RSS, { name: "A", region: "Brasil" });
  const b = parseFeed(RSS, { name: "B", region: "Global" });
  const merged = mergeNews([a, b], 10);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].link, "https://exemplo.com/b");
});
