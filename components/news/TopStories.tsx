"use client";

import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/rss.ts";
import { ago } from "../format.ts";
import Thumb, { slug } from "./Thumb.tsx";

export default function TopStories({ items, renderedAt }: { items: NewsItem[]; renderedAt: number }) {
  const [now, setNow] = useState(renderedAt);
  useEffect(() => setNow(Date.now()), []);

  return (
    <section className="block" aria-labelledby="principais">
      <h2 className="block-title" id="principais">Principais notícias de cripto hoje</h2>
      <div className="cards">
        {items.map((i) => (
          <a key={i.link} className="card" href={i.link} target="_blank" rel="noopener">
            <Thumb item={i} />
            <span className={`cat cat-${slug(i.category)}`}>{i.category}</span>
            <span className="card-title">{i.title}</span>
            <span className="byline">
              {i.source} · {ago(Date.parse(i.publishedAt), now)}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
