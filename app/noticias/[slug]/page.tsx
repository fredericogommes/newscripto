import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEvents } from "@/lib/data.ts";
import { getMarket } from "@/lib/market.ts";
import { SITE_URL, articlePath, getArticle, getArticles, readingMinutes, type Article } from "@/lib/articles.ts";
import SiteHeader from "@/components/SiteHeader.tsx";
import SiteFooter from "@/components/SiteFooter.tsx";
import TickerBar from "@/components/TickerBar.tsx";
import MarketWidget from "@/components/side/MarketWidget.tsx";
import NextEvents from "@/components/side/NextEvents.tsx";
import ShareBar from "@/components/ShareBar.tsx";
import { slug as catSlug } from "@/components/news/Thumb.tsx";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

const longDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const a = await getArticle((await params).slug);
  if (!a) return { title: "Matéria não encontrada · Jornal Cripto" };
  const url = `${SITE_URL}${articlePath(a.slug)}`;
  return {
    title: `${a.title} · Jornal Cripto`,
    description: a.dek,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: a.title,
      description: a.dek,
      siteName: "Jornal Cripto",
      locale: "pt_BR",
      publishedTime: a.publishedAt,
      modifiedTime: a.updatedAt,
      section: a.category,
      images: a.imageUrl ? [{ url: a.imageUrl }] : undefined,
    },
    twitter: { card: a.imageUrl ? "summary_large_image" : "summary", title: a.title, description: a.dek },
  };
}

function jsonLd(a: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    description: a.dek,
    image: a.imageUrl ? [a.imageUrl] : undefined,
    datePublished: a.publishedAt,
    dateModified: a.updatedAt,
    articleSection: a.category,
    inLanguage: "pt-BR",
    author: { "@type": "Organization", name: a.author },
    publisher: { "@type": "Organization", name: "Jornal Cripto", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}${articlePath(a.slug)}`,
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const [article, recent, market, events] = await Promise.all([getArticle(slug), getArticles(30), getMarket(), getEvents()]);
  if (!article) notFound();
  const a = article;
  const related = [
    ...recent.filter((r) => r.slug !== a.slug && r.category === a.category),
    ...recent.filter((r) => r.slug !== a.slug && r.category !== a.category),
  ].slice(0, 4);
  const now = Date.now();
  const edition = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <>
      <TickerBar market={market} />
      <SiteHeader edition={edition} />
      <main className="wrap">
        <div className="layout">
          <article className="article main-col">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(a)).replace(/</g, "\\u003c") }} />
            <nav className="crumbs meta" aria-label="Você está em">
              <a href="/">Início</a> › <a href="/#noticias">Notícias</a> › <span>{a.category}</span>
            </nav>
            <header className="article-head">
              <span className={`cat cat-${catSlug(a.category)}`}>{a.category}</span>
              <h1>{a.title}</h1>
              <p className="dek">{a.dek}</p>
              <p className="byline">
                <b>{a.author}</b>
                <span>·</span>
                <time dateTime={a.publishedAt}>{longDate(a.publishedAt)}</time>
                {a.updatedAt !== a.publishedAt && Date.parse(a.updatedAt) - Date.parse(a.publishedAt) > 6e4 && (
                  <span>· atualizada em {longDate(a.updatedAt)}</span>
                )}
                <span>· {readingMinutes(a)} min de leitura</span>
              </p>
              <ShareBar url={`${SITE_URL}${articlePath(a.slug)}`} title={a.title} />
            </header>
            {a.imageUrl && (
              <figure className="article-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.imageUrl} alt="" referrerPolicy="no-referrer" />
                {a.imageCredit && <figcaption className="meta">Imagem: {a.imageCredit}</figcaption>}
              </figure>
            )}
            <div className="article-body">
              {a.body.map((p, i) => (p.startsWith("## ") ? <h2 key={i}>{p.slice(3)}</h2> : <p key={i}>{p}</p>))}
            </div>
            {a.tickers.length > 0 && (
              <p className="assets">
                {a.tickers.map((t) => <span key={t} className="asset">{t}</span>)}
              </p>
            )}
            <aside className="article-note">
              <b>Conteúdo informativo.</b> Esta matéria não é recomendação de compra, venda ou manutenção de ativos.
              Criptoativos são voláteis e você pode perder parte ou todo o valor investido.
            </aside>
            {a.sources.length > 0 && (
              <section className="article-sources" aria-labelledby="fontes">
                <h2 id="fontes">Fontes consultadas</h2>
                <ul>
                  {a.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener nofollow">{s.name}</a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {related.length > 0 && (
              <section className="block" aria-labelledby="leia">
                <h2 className="block-title" id="leia">Leia também</h2>
                <div className="cards two">
                  {related.map((r) => (
                    <a key={r.slug} className="card" href={articlePath(r.slug)}>
                      <span className={`thumb cat-${catSlug(r.category)}`}>
                        {r.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="thumb-fallback" aria-hidden="true"><b>{r.tickers[0] ?? r.category}</b></span>
                        )}
                      </span>
                      <span className={`cat cat-${catSlug(r.category)}`}>{r.category}</span>
                      <span className="card-title">{r.title}</span>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </article>
          <aside className="side-col" aria-label="Mercado e agenda">
            <MarketWidget market={market} />
            <NextEvents events={events} now={now} />
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
