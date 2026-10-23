export type EventCategory = "rede" | "unlock" | "macro" | "reg";
export type EventBias = "up" | "down" | "vol" | "neu";

export interface MarketEvent {
  slug: string;
  category: EventCategory;
  title: string;
  description: string;
  note: string;
  startsAt: string; // ISO 8601
  allDay: boolean;
  timeConfirmed: boolean;
  /** Tickers afetados. "*" = todo o mercado (exceto stablecoins); "BR" = usuários no Brasil. */
  assets: string[];
  bias: EventBias;
  biasLabel: string;
}

export interface AssetProfile {
  ticker: string;
  name: string;
  annualVol: number;
  betaBtc: number;
  isStable: boolean;
  // Campos abaixo só existem quando o universo vem da CoinGecko ao vivo.
  rank?: number;
  image?: string;
  priceBrl?: number;
  change24h?: number; // %
  change7d?: number; // %
  change30d?: number; // %
  athChange?: number; // % abaixo da máxima histórica (negativo)
  exchanges?: string[];
  /** true quando vol e beta foram medidos nos preços horários dos últimos 7 dias. */
  measured?: boolean;
}

export interface Position {
  ticker: string;
  valueBrl: number;
  /** Quando preenchida, a posição é informada em unidades e o valor sai do preço atual em R$. */
  qty?: number;
}

export interface EditionItem {
  tag: string;
  title: string;
  body: string;
  source: string;
  /** Link da matéria: interno (/noticias/...) quando a redação publicou, senão a fonte. */
  url: string;
}

/** Boletim escrito pelo agente agendado às 8h, 12h e 20h. */
export interface Edition {
  slot: "08h" | "12h" | "20h" | "extra";
  publishedAt: string;
  headline: string;
  items: EditionItem[];
  sourcesChecked: string[];
}
