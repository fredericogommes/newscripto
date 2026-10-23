"use client";

import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/rss.ts";
import { ago } from "../format.ts";
import Thumb, { slug } from "./Thumb.tsx";

/** Abertura no formato dos portais: uma manchete grande e a coluna de últimas notícias ao lado. */
export default function NewsHero({
  featured,
  latest,
  renderedAt,
}: {
  featured: NewsItem;
  latest: NewsItem[];
  renderedAt: number;
}) {
  const [now, setNow] = useState(renderedAt);
  useEffect(() => setNow(Date.now()), []);

  return (
    <section className="hero" aria-label="Destaques">
      <a className="hero-main" href={featured.link} target="_blank" rel="noopener">
        <Thumb item={featured} eager />
        <span className="hero-text">
          <span className={`cat cat-${slug(featured.category)}`}>{featured.category}</span>
          <span className="hero-title">{featured.title}</span>
          {featured.summary && <span className="hero-sum">{featured.summary}</span>}
          <span className="byline">
            {featured.source} · {ago(Date.parse(featured.publishedAt), now)}
          </span>
        </span>
      </a>
      <div className="latest">
        <h2 className="block-title">Últimas notícias</h2>
        <ol>
          {latest.map((i) => (
            <li key={i.link}>
              <time className="latest-time" dateTime={i.publishedAt}>{ago(Date.parse(i.publishedAt), now)}</time>
              <a href={i.link} target="_blank" rel="noopener">{i.title}</a>
              <span className="latest-src">{i.source}</span>
            </li>
          ))}
        </ol>
        <a className="more" href="#noticias">Ver todas as notícias →</a>
      </div>
    </section>
  );
}
