import type { MarketData } from "@/lib/market.ts";
import { asOfLabel, brlPrice, signedPct, usdPrice } from "./format.ts";

/** Faixa de cotações que corre no topo, como nos portais; para ao passar o mouse e fica parada com movimento reduzido. */
export default function TickerBar({ market }: { market: MarketData }) {
  const items = (
    <>
      {market.quotes.map((q) => (
        <span key={q.ticker} className="tb-item">
          <b>{q.ticker}</b>
          <span className="num">{q.brl !== null ? brlPrice(q.brl) : usdPrice(q.usd)}</span>
          <span className={`num chg ${q.change24h >= 0 ? "up" : "down"}`}>
            {q.change24h >= 0 ? "▲" : "▼"} {signedPct(q.change24h)}
          </span>
        </span>
      ))}
      {market.usdBrl !== null && (
        <span className="tb-item">
          <b>USD/BRL</b>
          <span className="num">{brlPrice(market.usdBrl)}</span>
        </span>
      )}
      {market.fearGreed && (
        <span className="tb-item">
          <b>Medo e Ganância</b>
          <span className="num">{market.fearGreed.value}</span>
          <span>{market.fearGreed.label}</span>
        </span>
      )}
    </>
  );
  return (
    <div className="tickerbar" role="region" aria-label="Cotações">
      <span className={`tb-live ${market.live ? "on" : ""}`}>
        {market.live ? `Ao vivo · ${asOfLabel(market.asOf)}` : `Retrato · ${asOfLabel(market.asOf)}`}
      </span>
      <div className="tb-track">
        <div className="tb-run">
          {items}
          <span className="tb-copy" aria-hidden="true">{items}</span>
        </div>
      </div>
    </div>
  );
}
