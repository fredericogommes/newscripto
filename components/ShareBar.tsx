"use client";

import { useState } from "react";

export default function ShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <div className="share" aria-label="Compartilhar">
      <a href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noopener">WhatsApp</a>
      <a href={`https://t.me/share/url?url=${u}&text=${t}`} target="_blank" rel="noopener">Telegram</a>
      <a href={`https://x.com/intent/post?url=${u}&text=${t}`} target="_blank" rel="noopener">X</a>
      <button type="button" onClick={copy}>{copied ? "Link copiado" : "Copiar link"}</button>
    </div>
  );
}
