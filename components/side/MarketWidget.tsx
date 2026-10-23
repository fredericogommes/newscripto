import type { MarketData } from "@/lib/market.ts";
import { asOfLabel, brlPrice, signedPct, usdPrice } from "../format.ts";

export default function MarketWidget({ market }: { market: MarketData }) {
  return (
    <section className="widget" id="mercado" aria-labelledby="mercado-title">
      <h2 className="block-title" id="mercado-title">Mercados</h2>
      <table className="mkt">
        <thead>
          <tr>
            <th>Ativo</th>
            <th className="r">Preço</th>
            <th className="r">24h</th>
          </tr>
        </thead>
        <tbody>
          {market.quotes.map((q) => (
            <tr key={q.ticker}>
              <td>
                <b>{q.ticker}</b>
                <span className="meta"> {q.name !== q.ticker ? q.name : ""}</span>
              </td>
              <td className="r num">
                {q.brl !== null ? brlPrice(q.brl) : usdPrice(q.usd)}
                {q.brl !== null && <span className="meta sub">{usdPrice(q.usd)}</span>}
              </td>
              <td className={`r num chg ${q.change24h >= 0 ? "up" : "down"}`}>{signedPct(q.change24h)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="meta">
        {market.live ? `CoinGecko, ao vivo · ${asOfLabel(market.asOf)}` : `Retrato de ${asOfLabel(market.asOf)}; a fonte ao vivo não respondeu.`}
        {market.usdBrl !== null && ` Dólar implícito: ${brlPrice(market.usdBrl)}.`}
      </p>
    </section>
  );
}
