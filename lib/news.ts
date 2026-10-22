import { NEWS_SOURCES } from "./news-sources.ts";
import { mergeNews, parseFeed, type NewsItem } from "./rss.ts";

const TIMEOUT_MS = 8000;

/**
 * Manchetes recentes dos portais de referência. Um feed que falha ou demora é ignorado;
 * se todos falharem, devolve lista vazia e a página mostra as manchetes do relatório diário.
 */
export async function getNews(limit = 60): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    NEWS_SOURCES.map(async (source) => {
      const res = await fetch(source.url, {
        headers: { "User-Agent": "JornalCripto/0.1 (+radar de manchetes)" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        next: { revalidate: 600 },
      });
      if (!res.ok) throw new Error(`${source.name}: HTTP ${res.status}`);
      return parseFeed(await res.text(), source).slice(0, 15);
    }),
  );
  const lists = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  return mergeNews(lists, limit);
}
