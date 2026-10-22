import { MARKET_SNAPSHOT } from "@/lib/sample-data.ts";

const pctFmt = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("pt-BR")}%`;

export default function TickerBar() {
  return (
    <div className="tickerbar" role="region" aria-label="Cotações">
      <div className="tickerbar-inner">
        {MARKET_SNAPSHOT.tickers.map((t) => (
          <span key={t.label} className="tb-item">
            <b>{t.label.split(" · ").at(-1)}</b>
            <span className="num">{t.price}</span>
            <span className={`num chg ${t.change >= 0 ? "up" : "down"}`}>{pctFmt(t.change)}</span>
          </span>
        ))}
        <span className="tb-item">
          <b>Medo e Ganância</b>
          <span className="num">{MARKET_SNAPSHOT.fearGreed.value}</span>
        </span>
        <span className="tb-asof">{MARKET_SNAPSHOT.asOf}</span>
      </div>
    </div>
  );
}
