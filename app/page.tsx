import { getEvents, getProfiles } from "@/lib/data.ts";
import { getNews } from "@/lib/news.ts";
import { getMarket } from "@/lib/market.ts";
import type { NewsItem } from "@/lib/rss.ts";
import { NEWS_SOURCES } from "@/lib/news-sources.ts";
import Dashboard from "@/components/Dashboard.tsx";
import Glossary from "@/components/Glossary.tsx";
import SiteHeader from "@/components/SiteHeader.tsx";
import TickerBar from "@/components/TickerBar.tsx";
import NewsHero from "@/components/news/NewsHero.tsx";
import TopStories from "@/components/news/TopStories.tsx";
import NewsFeed from "@/components/news/NewsFeed.tsx";
import MarketWidget from "@/components/side/MarketWidget.tsx";
import FearGreed from "@/components/side/FearGreed.tsx";
import NextEvents from "@/components/side/NextEvents.tsx";
import Briefing from "@/components/side/Briefing.tsx";

// A agenda muda ao longo do dia; regenera a página a cada 5 minutos.
export const revalidate = 300;

/** Escolhe a manchete de abertura (de preferência brasileira e com foto), as últimas e os cards com imagem. */
function frontPage(news: NewsItem[]) {
  const recent = news.slice(0, 20);
  const featured =
    recent.find((i) => i.image && i.region === "Brasil") ?? recent.find((i) => i.image) ?? news[0];
  const rest = news.filter((i) => i !== featured);
  const latest = rest.slice(0, 6);
  const used = new Set([featured, ...latest]);
  const pool = rest.filter((i) => !used.has(i));
  const top = [...pool.filter((i) => i.image), ...pool.filter((i) => !i.image)].slice(0, 6);
  return { featured, latest, top };
}

export default async function Home() {
  const [events, profiles, news, market] = await Promise.all([getEvents(), getProfiles(), getNews(), getMarket()]);
  const renderedAt = Date.now();
  const edition = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });
  const front = news.length > 0 ? frontPage(news) : null;

  return (
    <>
      <TickerBar market={market} />
      <SiteHeader edition={edition} />
      <p className="notice-strip">
        <b>Conteúdo só informativo.</b> Nada aqui é recomendação de compra, venda ou manutenção de ativos. &quot;Viés&quot;
        é a reação que o mercado costuma ter a esse tipo de evento, não uma previsão.
      </p>

      <main className="wrap">
        <h1 className="sr">Jornal Cripto: notícias de Bitcoin, Ethereum e do mercado cripto no Brasil</h1>
        {front && <NewsHero featured={front.featured} latest={front.latest} renderedAt={renderedAt} />}

        <div className="layout">
          <div className="main-col">
            {front && front.top.length > 0 && <TopStories items={front.top} renderedAt={renderedAt} />}
            {news.length > 0 ? (
              <NewsFeed items={news} renderedAt={renderedAt} />
            ) : (
              <section className="block section" id="noticias">
                <h2 className="block-title">Notícias</h2>
                <p className="meta">Os portais não responderam agora. Veja o resumo do dia ao lado; a lista volta sozinha em alguns minutos.</p>
              </section>
            )}
          </div>
          <aside className="side-col" aria-label="Mercado e agenda">
            <MarketWidget market={market} />
            {market.fearGreed && <FearGreed fg={market.fearGreed} />}
            <NextEvents events={events} now={renderedAt} />
            <Briefing />
          </aside>
        </div>

        <div className="tools-band">
          <p className="band-title">Ferramentas do Jornal Cripto</p>
          <Dashboard events={events} profiles={profiles} renderedAt={renderedAt} />
        </div>

        <Glossary />
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo">
              <span className="logo-mark" aria-hidden="true">JC</span>
              <span className="logo-word">Jornal <b>Cripto</b></span>
            </span>
            <p>
              Manchetes de {NEWS_SOURCES.length} portais do Brasil e do mundo, agenda de eventos do mercado, calculadora de
              risco em reais e alertas da sua carteira.
            </p>
          </div>
          <nav className="footer-col" aria-label="Seções">
            <b>Seções</b>
            <a href="#noticias">Notícias</a>
            <a href="#mercado">Mercados</a>
            <a href="#agenda">Agenda</a>
            <a href="#risco">Calculadora de risco</a>
            <a href="#alertas">Alertas</a>
            <a href="#glossario">Glossário</a>
          </nav>
          <div className="footer-col">
            <b>Fontes</b>
            {NEWS_SOURCES.slice(0, 7).map((s) => (
              <span key={s.name}>{s.name}</span>
            ))}
            <span>e mais {NEWS_SOURCES.length - 7} portais</span>
          </div>
          <div className="footer-col footer-how">
            <b>Como fazemos</b>
            <p>
              As notícias mostram título, linha fina e miniatura publicados nos feeds dos portais, sempre com link para a
              matéria original. O resumo do dia vem do nosso relatório diário. O viés da agenda é a reação que o mercado
              teve a eventos parecidos, nunca uma previsão. Não publicamos conteúdo pago nem usamos links de afiliado.
              Preços da CoinGecko e índice de Medo e Ganância da alternative.me.
            </p>
          </div>
        </div>
        <p className="footer-legal">
          Este material é informativo e educacional. Não é recomendação de investimento, oferta ou consultoria. Criptoativos
          são voláteis e você pode perder parte ou todo o valor investido. © {new Date().getFullYear()} Jornal Cripto.
        </p>
      </footer>
    </>
  );
}
