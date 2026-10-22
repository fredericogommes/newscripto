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
