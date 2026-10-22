// Feeds RSS dos portais do levantamento "portais-cripto-por-pais" (out/2026).
// O radar mostra só título, fonte e link; nenhum texto é copiado.
export type Region = "Brasil" | "Global" | "LatAm";

export interface NewsSource {
  name: string;
  url: string;
  region: Region;
}

export const NEWS_SOURCES: NewsSource[] = [
  { name: "Portal do Bitcoin", url: "https://portaldobitcoin.uol.com.br/feed/", region: "Brasil" },
  { name: "Livecoins", url: "https://livecoins.com.br/feed/", region: "Brasil" },
  { name: "CriptoFácil", url: "https://criptofacil.com/feed/", region: "Brasil" },
  { name: "Cointelegraph Brasil", url: "https://br.cointelegraph.com/rss", region: "Brasil" },
  { name: "BeInCrypto Brasil", url: "https://pt.beincrypto.com/feed/", region: "Brasil" },
  { name: "Cointimes", url: "https://cointimes.com.br/feed/", region: "Brasil" },
  { name: "BlockTrends", url: "https://blocktrends.com.br/feed/", region: "Brasil" },
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/", region: "Global" },
  { name: "Cointelegraph", url: "https://cointelegraph.com/rss", region: "Global" },
  { name: "The Block", url: "https://www.theblock.co/rss.xml", region: "Global" },
  { name: "Decrypt", url: "https://decrypt.co/feed", region: "Global" },
  { name: "Bitcoin Magazine", url: "https://bitcoinmagazine.com/feed", region: "Global" },
  { name: "CryptoSlate", url: "https://cryptoslate.com/feed/", region: "Global" },
  { name: "Protos", url: "https://protos.com/feed/", region: "Global" },
  { name: "CriptoNoticias", url: "https://www.criptonoticias.com/feed/", region: "LatAm" },
];
