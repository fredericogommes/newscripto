"use client";

import { useState, type ReactNode } from "react";

/** Imagem de outro site; se não carregar, mostra o conteúdo alternativo em vez do ícone quebrado. */
export default function SafeImg({
  src,
  fallback = null,
  eager = false,
}: {
  src: string;
  fallback?: ReactNode;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
