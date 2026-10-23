import type { NewsItem } from "@/lib/rss.ts";
import SafeImg from "../SafeImg.tsx";

/** Miniatura do feed; sem imagem, mostra um bloco com a editoria e a fonte para manter a grade alinhada. */
export default function Thumb({ item, eager = false }: { item: NewsItem; eager?: boolean }) {
  const fallback = (
    <span className="thumb-fallback" aria-hidden="true">
      <b>{item.tickers[0] ?? item.category}</b>
      <span>{item.source}</span>
    </span>
  );
  return (
    <span className={`thumb cat-${slug(item.category)}`}>
      {item.image ? <SafeImg src={item.image} eager={eager} fallback={fallback} /> : fallback}
    </span>
  );
}

export const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Link externo abre em nova aba; matéria do próprio portal abre na mesma. */
export const linkProps = (href: string) => (/^https?:/.test(href) ? { target: "_blank", rel: "noopener" } : {});
