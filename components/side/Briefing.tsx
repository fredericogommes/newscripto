import { HEADLINES } from "@/lib/sample-data.ts";
import type { Edition } from "@/lib/types.ts";
import { asOfLabel } from "../format.ts";

const SLOT_LABEL = { "08h": "Boletim das 8h", "12h": "Boletim do meio-dia", "20h": "Boletim das 20h", extra: "Boletim extra" };

/** Boletim do agente agendado; sem edição publicada, mostra o resumo do relatório diário. */
export default function Briefing({ edition }: { edition: Edition | null }) {
  const items = edition ? edition.items : HEADLINES.map((h) => ({ ...h }));
  return (
    <section className="widget" id="boletim" aria-labelledby="brief-title">
      <h2 className="block-title" id="brief-title">{edition ? SLOT_LABEL[edition.slot] : "Resumo do dia"}</h2>
      {edition && (
        <p className="meta">
          {asOfLabel(edition.publishedAt)} · {edition.sourcesChecked.length} portais revisados
        </p>
      )}
      {edition && <p className="brief-head">{edition.headline}</p>}
      <ul className="brief">
        {items.map((h) => (
          <li key={h.title}>
            <span className="tag">{h.tag}</span>
            <span>
              <b>{h.title}</b> {h.body}{" "}
              <a href={h.url} {...(/^https?:/.test(h.url) ? { target: "_blank", rel: "noopener" } : {})}>{h.source}</a>
            </span>
          </li>
        ))}
      </ul>
      <p className="meta">Atualizado às 8h, 12h e 20h. Resumo informativo, não é recomendação.</p>
    </section>
  );
}
