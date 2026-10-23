import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jornal Cripto: notícias de Bitcoin, Ethereum e do mercado cripto",
  description: "Notícias cripto do Brasil e do mundo, agenda do mercado, calculadora de risco em reais e alertas. Conteúdo só informativo.",
};

export const viewport: Viewport = {
  themeColor: "#0b0f14",
};

// Aplica o tema salvo antes da primeira pintura, para não piscar.
const THEME_SCRIPT = `try{var t=localStorage.getItem("jornal-cripto-tema");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
