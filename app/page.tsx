import { getEvents, getProfiles } from "@/lib/data.ts";
import { HEADLINES, MARKET_SNAPSHOT } from "@/lib/sample-data.ts";
import { getNews } from "@/lib/news.ts";
import Dashboard from "@/components/Dashboard.tsx";
import Glossary from "@/components/Glossary.tsx";
import NewsRadar from "@/components/NewsRadar.tsx";
import TickerBar from "@/components/TickerBar.tsx";
import { NEWS_SOURCES } from "@/lib/news-sources.ts";

// A agenda muda ao longo do dia; regenera a página a cada 5 minutos.
export const revalidate = 300;

const pctFmt = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("pt-BR")}%`;

export default async function Home() {
  const [events, profiles, news] = await Promise.all([getEvents(), getProfiles(), getNews()]);
  const renderedAt = Date.now();
  const edition = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <>
    <TickerBar />
    <div className="wrap">
      <header className="mast">
        <div className="mast-top">
          <div>
            <p className="eyebrow">Edição de {edition}</p>
            <h1>Jornal Cripto</h1>
          </div>
          <nav aria-label="Seções">
            <a href="#mercado">Mercado</a>
            <a href="#noticias">Notícias</a>
            <a href="#agenda">Agenda</a>
            <a href="#risco">Calculadora</a>
            <a href="#alertas">Alertas</a>
            <a href="#glossario">Glossário</a>
          </nav>
        </div>
        <p className="notice">
          <b>Conteúdo só informativo.</b> Nada aqui é recomendação de compra, venda ou manutenção de ativos.
          &quot;Viés&quot; é a reação que o mercado costuma ter a esse tipo de evento, não uma previsão.
        </p>
      </header>

      <section className="section" id="mercado">
        <div className="section-head">
          <p className="eyebrow">Mercado · {MARKET_SNAPSHOT.asOf}</p>
          <h2>{MARKET_SNAPSHOT.headline}</h2>
          <p className="meta">Destaques do relatório diário.</p>
        </div>
        <div className="ticker">
          {MARKET_SNAPSHOT.tickers.map((t) => (
            <div className="tick" key={t.label}>
              <span className="sym">{t.label}</span>
              <span className="px num">{t.price}</span>
              <span className={`chg num ${t.change >= 0 ? "up" : "down"}`}>{pctFmt(t.change)} 24h</span>
            </div>
          ))}
          <div className="tick">
            <span className="sym">Medo e Ganância</span>
            <span className="px num">{MARKET_SNAPSHOT.fearGreed.value}</span>
            <span className="meta">Ganância · ontem {MARKET_SNAPSHOT.fearGreed.previous}</span>
          </div>
        </div>
        <ul className="headlines">
          {HEADLINES.map((h) => (
            <li key={h.title}>
              <span className="tag">{h.tag}</span>
              <span>
                <b>{h.title}</b> {h.body}{" "}
                <a href={h.url} target="_blank" rel="noopener">
                  {h.source}
                </a>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {news.length > 0 && <NewsRadar items={news} renderedAt={renderedAt} />}

      <Dashboard events={events} profiles={profiles} renderedAt={renderedAt} />

      <Glossary />

      <footer>
        <p>
          <b>Como fazemos.</b> Os destaques do dia vêm do relatório diário, compilado de The Block, Decrypt, CoinDesk,
          MarketAlleys, KuCoin, Livecoins e CoinGecko. O radar mostra só título e link de {NEWS_SOURCES.length} portais
          de referência; o texto fica na fonte. O viés da agenda é a reação que o mercado teve a eventos parecidos, nunca
          uma previsão. Não publicamos conteúdo pago nem usamos links de afiliado. Preços da manhã, sem atualização em
          tempo real nesta versão.
        </p>
        <p>
          Este material é informativo e educacional. Não é recomendação de investimento, oferta ou consultoria.
          Criptoativos são voláteis e você pode perder parte ou todo o valor investido.
        </p>
      </footer>
    </div>
    </>
  );
}
