import { GLOSSARY } from "@/lib/glossary.ts";

export default function Glossary() {
  return (
    <section className="section" id="glossario">
      <div className="section-head">
        <p className="eyebrow">Glossário</p>
        <h2>Termos que aparecem na agenda e na calculadora</h2>
      </div>
      <dl className="glossary">
        {GLOSSARY.map((g) => (
          <div key={g.term}>
            <dt>{g.term}</dt>
            <dd>{g.meaning}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
