// Dados de exemplo, iguais a supabase/seed.sql. Usados quando o Supabase não está configurado.
// Fonte: relatórios diários de 15 a 22/10/2026 (relatorios-cripto/).
import type { AssetProfile, MarketEvent } from "./types.ts";

export const SAMPLE_PROFILES: AssetProfile[] = [
  { ticker: "BTC", name: "Bitcoin", annualVol: 0.45, betaBtc: 1, isStable: false },
  { ticker: "ETH", name: "Ethereum", annualVol: 0.65, betaBtc: 1.3, isStable: false },
  { ticker: "SOL", name: "Solana", annualVol: 0.8, betaBtc: 1.5, isStable: false },
  { ticker: "XRP", name: "XRP", annualVol: 0.75, betaBtc: 1.3, isStable: false },
  { ticker: "BNB", name: "BNB", annualVol: 0.55, betaBtc: 0.9, isStable: false },
  { ticker: "ADA", name: "Cardano", annualVol: 0.8, betaBtc: 1.5, isStable: false },
  { ticker: "DOGE", name: "Dogecoin", annualVol: 0.95, betaBtc: 1.7, isStable: false },
  { ticker: "LINK", name: "Chainlink", annualVol: 0.85, betaBtc: 1.5, isStable: false },
  { ticker: "AVAX", name: "Avalanche", annualVol: 0.9, betaBtc: 1.6, isStable: false },
  { ticker: "DOT", name: "Polkadot", annualVol: 0.85, betaBtc: 1.5, isStable: false },
  { ticker: "USDT", name: "Tether", annualVol: 0.01, betaBtc: 0, isStable: true },
  { ticker: "USDC", name: "USD Coin", annualVol: 0.01, betaBtc: 0, isStable: true },
  { ticker: "OUTRO", name: "Outro ativo", annualVol: 1, betaBtc: 1.6, isStable: false },
];

const ev = (e: Omit<MarketEvent, "startsAt"> & { at: string }): MarketEvent => {
  const { at, ...rest } = e;
  return { ...rest, startsAt: new Date(at + "-03:00").toISOString() };
};

export const SAMPLE_EVENTS: MarketEvent[] = [
  ev({ slug: "zro-unlock-2026-10-20", category: "unlock", title: "Desbloqueio do ZRO", description: "Cerca de US$ 57 mi em tokens LayerZero liberados.", note: "Desbloqueios grandes costumam pesar no preço nos dias em torno da data.", at: "2026-10-20T00:00", allDay: true, timeConfirmed: false, assets: ["ZRO"], bias: "down", biasLabel: "Pressão vendedora" }),
  ev({ slug: "sol-alpenglow", category: "rede", title: "Solana Alpenglow na rede principal", description: "Maior reformulação do consenso desde 2020. Confirmação final caiu para 150 ms.", note: "Reação observada: SOL foi de US$ 106 para US$ 105 (−0,7%) nas 24 h seguintes.", at: "2026-10-21T00:00", allDay: true, timeConfirmed: true, assets: ["SOL"], bias: "vol", biasLabel: "Volatilidade" }),
  ev({ slug: "ake-unlock-2026-10-21", category: "unlock", title: "Desbloqueio do AKE", description: "Cerca de US$ 65 mi em tokens liberados.", note: "", at: "2026-10-21T00:00", allDay: true, timeConfirmed: false, assets: ["AKE"], bias: "down", biasLabel: "Pressão vendedora" }),
  ev({ slug: "us-pmi-2026-10-23", category: "macro", title: "PMIs preliminares dos EUA", description: "Termômetro de atividade de indústria e serviços em outubro.", note: "Dado acima do esperado tende a fortalecer o dólar, o que historicamente pesa sobre cripto.", at: "2026-10-23T10:45", allDay: false, timeConfirmed: false, assets: ["*"], bias: "vol", biasLabel: "Volatilidade pontual" }),
  ev({ slug: "fomc-2026-10-28", category: "macro", title: "Decisão de juros do Fed", description: "Reunião de 27 e 28/10, com coletiva às 15h30.", note: "A direção costuma depender da surpresa em relação ao esperado, não da decisão em si.", at: "2026-10-28T15:00", allDay: false, timeConfirmed: false, assets: ["*"], bias: "vol", biasLabel: "Volatilidade alta" }),
  ev({ slug: "strategy-vote-2026-10-28", category: "macro", title: "Votação dos acionistas da Strategy", description: "Assembleia da maior empresa com bitcoin em caixa.", note: "Afeta mais a ação MSTR que o BTC diretamente.", at: "2026-10-28T00:00", allDay: true, timeConfirmed: false, assets: ["BTC"], bias: "neu", biasLabel: "Neutro" }),
  ev({ slug: "ripio-br-2026-10-29", category: "reg", title: "Ripio encerra Pix e negociação no Brasil", description: "Clientes precisam sacar ou transferir os saldos antes.", note: "Sem efeito esperado no preço; é um prazo para quem usa a corretora.", at: "2026-10-29T00:00", allDay: true, timeConfirmed: true, assets: ["BR"], bias: "neu", biasLabel: "Operacional" }),
  ev({ slug: "ar-exchanges-2026-11-01", category: "reg", title: "Argentina: novas regras para corretoras", description: "Exigência de dados de investidores e proibição de mixers.", note: "Impacto regional.", at: "2026-11-01T00:00", allDay: true, timeConfirmed: true, assets: ["*"], bias: "neu", biasLabel: "Neutro" }),
  ev({ slug: "msci-2026-11-11", category: "macro", title: "Revisão de índices do MSCI", description: "Lista que pode afetar empresas com cripto em caixa.", note: "Citado no relatório de 16/10.", at: "2026-11-11T00:00", allDay: true, timeConfirmed: false, assets: ["BTC"], bias: "vol", biasLabel: "Volatilidade" }),
  ev({ slug: "genius-act-2027-01-18", category: "reg", title: "Regras das stablecoins entram em vigor nos EUA", description: "Regulamentação final do GENIUS Act pelo OCC.", note: "Clareza regulatória costuma ser lida como positiva no longo prazo.", at: "2027-01-18T00:00", allDay: true, timeConfirmed: true, assets: ["USDT", "USDC", "ETH", "SOL"], bias: "up", biasLabel: "Positivo estrutural" }),
];

// Retrato do mercado e manchetes do relatório de 22/10/2026. A etapa 2 troca por coleta automática.
export const MARKET_SNAPSHOT = {
  asOf: "22/10, 05:45 UTC",
  headline: "O BTC encostou em US$ 84,8 mil e devolveu a alta",
  tickers: [
    { label: "Bitcoin · BTC", price: "US$ 82,7 mil", change: 0.1 },
    { label: "Ethereum · ETH", price: "US$ 2.437", change: -0.1 },
    { label: "Solana · SOL", price: "US$ 105", change: -0.7 },
    { label: "XRP", price: "US$ 1,34", change: 0.7 },
  ],
  fearGreed: { value: 68, previous: 63 },
};

export const HEADLINES = [
  { tag: "Rede · SOL", title: "Alpenglow no ar.", body: "A atualização da Solana levou a confirmação final das transações para 150 ms.", source: "The Block", url: "https://www.theblock.co/news" },
  { tag: "Fluxo", title: "ETFs de BTC receberam US$ 528 mi em 21/10.", body: "Os de ETH encerraram cinco dias seguidos de saída.", source: "Decrypt", url: "https://decrypt.co/news" },
  { tag: "Regulação", title: "Regras finais das stablecoins nos EUA.", body: "O OCC concluiu o GENIUS Act, que vale a partir de 18/01/2027.", source: "The Block", url: "https://www.theblock.co/news" },
  { tag: "Brasil", title: "Ripio encerra Pix e negociação no Brasil em 29/10.", body: "Clientes com saldo precisam sacar ou transferir antes.", source: "Livecoins", url: "https://livecoins.com.br/noticias/" },
  { tag: "Institucional", title: "Standard Chartered compra a Zodia Custody", body: "e a Grayscale amplia aportes in-kind para 10 produtos.", source: "The Block", url: "https://www.theblock.co/news" },
];
