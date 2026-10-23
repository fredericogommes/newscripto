import { HEADLINES } from "@/lib/sample-data.ts";

export default function Briefing() {
  return (
    <section className="widget" aria-labelledby="brief-title">
      <h2 className="block-title" id="brief-title">Resumo do dia</h2>
      <ul className="brief">
        {HEADLINES.map((h) => (
          <li key={h.title}>
            <span className="tag">{h.tag}</span>
            <span>
              <b>{h.title}</b> {h.body}{" "}
              <a href={h.url} target="_blank" rel="noopener">{h.source}</a>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
