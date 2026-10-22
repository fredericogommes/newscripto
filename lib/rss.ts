import type { Region } from "./news-sources.ts";

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  region: Region;
  publishedAt: string; // ISO 8601
  tickers: string[];
}

// Palavras que marcam o ativo de uma manchete. Ordem importa só para a exibição das tags.
const TICKER_WORDS: [string, RegExp][] = [
  ["BTC", /\b(bitcoin|btc)\b/i],
  ["ETH", /\b(ethereum|ether|eth)\b/i],
  ["SOL", /\b(solana|sol)\b/i],
  ["XRP", /\b(xrp|ripple)\b/i],
  ["BNB", /\b(bnb|binance coin)\b/i],
  ["ADA", /\b(cardano|ada)\b/i],
  ["DOGE", /\b(dogecoin|doge)\b/i],
  ["LINK", /\b(chainlink)\b/i],
  ["AVAX", /\b(avalanche|avax)\b/i],
  ["DOT", /\b(polkadot)\b/i],
  ["USDT", /\b(tether|usdt)\b/i],
  ["USDC", /\b(usdc|circle)\b/i],
];

export function detectTickers(text: string): string[] {
  return TICKER_WORDS.filter(([, re]) => re.test(text)).map(([t]) => t);
}

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  hellip: "…", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
};
// Acentos do português e do espanhol: á, Á, ã, ç, ê, à, ñ…
for (const [mark, letters] of Object.entries({ acute: "aeiou", tilde: "aon", circ: "aeo", grave: "a", cedil: "c" })) {
  for (const l of letters) {
    ENTITIES[l + mark] = (l + { acute: "\u0301", tilde: "\u0303", circ: "\u0302", grave: "\u0300", cedil: "\u0327" }[mark]).normalize("NFC");
    ENTITIES[l.toUpperCase() + mark] = ENTITIES[l + mark].toUpperCase();
  }
}

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e] ?? ENTITIES[e.toLowerCase()] ?? m;
  });
}

function tag(block: string, name: string): string | undefined {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  if (!m) return undefined;
  const raw = m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1");
  return decodeEntities(raw.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

/** Lê itens de RSS 2.0 (<item>) ou Atom (<entry>). Itens sem título, link ou data válida são descartados. */
export function parseFeed(xml: string, source: { name: string; region: Region }): NewsItem[] {
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) ?? [];
  const items: NewsItem[] = [];
  for (const b of blocks) {
    const title = tag(b, "title");
    const link = tag(b, "link") || b.match(/<link[^>]*href="([^"]+)"/i)?.[1];
    const date = tag(b, "pubDate") ?? tag(b, "published") ?? tag(b, "updated") ?? tag(b, "dc:date");
    const time = date ? Date.parse(date) : NaN;
    if (!title || !link || !/^https?:\/\//.test(link) || Number.isNaN(time)) continue;
    items.push({
      title,
      link,
      source: source.name,
      region: source.region,
      publishedAt: new Date(time).toISOString(),
      tickers: detectTickers(title),
    });
  }
  return items;
}

/** Junta feeds, remove repetidos (mesmo link ou mesmo título) e ordena do mais novo para o mais antigo. */
export function mergeNews(lists: NewsItem[][], limit: number): NewsItem[] {
  const seen = new Set<string>();
  return lists
    .flat()
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .filter((i) => {
      const keys = [i.link, i.title.toLowerCase()];
      if (keys.some((k) => seen.has(k))) return false;
      keys.forEach((k) => seen.add(k));
      return true;
    })
    .slice(0, limit);
}
