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
}

export interface Position {
  ticker: string;
  valueBrl: number;
}

export interface EditionItem {
  tag: string;
  title: string;
  body: string;
  source: string;
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
