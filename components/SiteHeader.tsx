"use client";

import { useEffect, useState } from "react";

const NAV = [
  ["Notícias", "/#noticias"],
  ["Mercados", "/#mercado"],
  ["Agenda", "/#agenda"],
  ["Calculadora", "/#risco"],
  ["Alertas", "/#alertas"],
  ["Glossário", "/#glossario"],
] as const;

type Theme = "light" | "dark";

export default function SiteHeader({ edition }: { edition: string }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const t = document.documentElement.dataset.theme as Theme | undefined;
    setTheme(t ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("jornal-cripto-tema", next);
    } catch {}
    setTheme(next);
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="logo" href="/" aria-label="Jornal Cripto, início">
          <span className="logo-mark" aria-hidden="true">JC</span>
          <span className="logo-word">
            Jornal <b>Cripto</b>
          </span>
        </a>
        <nav id="menu" className={open ? "open" : ""} aria-label="Seções">
          {NAV.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <span className="edition">{edition}</span>
        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
          title="Alternar tema"
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
        <button className="icon-btn menu-btn" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
          <span className="sr">Menu</span>
        </button>
      </div>
    </header>
  );
}
