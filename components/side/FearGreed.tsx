import type { MarketData } from "@/lib/market.ts";

export default function FearGreed({ fg }: { fg: NonNullable<MarketData["fearGreed"]> }) {
  const delta = fg.previous !== null ? fg.value - fg.previous : null;
  return (
    <section className="widget" aria-labelledby="fg-title">
      <h2 className="block-title" id="fg-title">Medo e Ganância</h2>
      <div className="fg">
        <span className="fg-value num">{fg.value}</span>
        <span>
          <b>{fg.label}</b>
          {delta !== null && (
            <span className="meta">
              {" "}· ontem {fg.previous} ({delta > 0 ? "+" : ""}{delta})
            </span>
          )}
        </span>
      </div>
      <div className="gauge fg-gauge" role="img" aria-label={`Índice em ${fg.value} de 100`}>
        <i style={{ left: `${fg.value}%` }} />
      </div>
      <p className="meta fg-scale"><span>Medo extremo</span><span>Ganância extrema</span></p>
      <p className="meta">Mede o humor do mercado de 0 a 100 (alternative.me). Não indica direção de preço.</p>
    </section>
  );
}
