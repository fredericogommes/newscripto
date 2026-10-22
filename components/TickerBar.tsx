import type { MarketData } from "@/lib/market.ts";
import { asOfLabel, brlPrice, signedPct, usdPrice } from "./format.ts";

export default function TickerBar({ market }: { market: MarketData }) {
  return (
    <div className="tickerbar" role="region" aria-label="Cotações">
      <div className="tickerbar-inner">
        {market.quotes.map((q) => (
          <span key={q.ticker} className="tb-item">
            <b>{q.ticker}</b>
            <span className="num">{q.brl !== null ? brlPrice(q.brl) : usdPrice(q.usd)}</span>
            <span className={`num chg ${q.change24h >= 0 ? "up" : "down"}`}>{signedPct(q.change24h)}</span>
          </span>
        ))}
        {market.usdBrl !== null && (
          <span className="tb-item">
            <b>Dólar</b>
            <span className="num">{brlPrice(market.usdBrl)}</span>
          </span>
        )}
        {market.fearGreed && (
          <span className="tb-item">
            <b>Medo e Ganância</b>
            <span className="num">{market.fearGreed.value}</span>
          </span>
        )}
        <span className="tb-asof">
          {market.live ? `Ao vivo · ${asOfLabel(market.asOf)}` : `Retrato de ${asOfLabel(market.asOf)}`}
        </span>
      </div>
    </div>
  );
}
