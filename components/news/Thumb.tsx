import type { NewsItem } from "@/lib/rss.ts";

/** Miniatura do feed; sem imagem, mostra um bloco com a editoria e a fonte para manter a grade alinhada. */
export default function Thumb({ item, eager = false }: { item: NewsItem; eager?: boolean }) {
  return (
    <span className={`thumb cat-${slug(item.category)}`}>
      {item.image ? (
        // Imagem servida pelo próprio portal, como no feed; sem otimização para não copiar o arquivo.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt="" loading={eager ? "eager" : "lazy"} referrerPolicy="no-referrer" decoding="async" />
      ) : (
        <span className="thumb-fallback" aria-hidden="true">
          <b>{item.tickers[0] ?? item.category}</b>
          <span>{item.source}</span>
        </span>
      )}
    </span>
  );
}

export const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
