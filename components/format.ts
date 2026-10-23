const TZ = "America/Sao_Paulo";

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const pct = (n: number) => `${(n * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

export function relative(date: number, now: number) {
  const ms = date - now;
  const h = Math.round(Math.abs(ms) / 36e5);
  const span = h < 48 ? `${h} h` : `${Math.round(h / 24)} dias`;
  return ms < 0 ? `ocorreu há ${span}` : `em ${span}`;
}

export const dayLabel = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: TZ }).replace(".", "");
export const weekdayLabel = (d: Date) =>
  d.toLocaleDateString("pt-BR", { weekday: "short", timeZone: TZ }).replace(".", "");
export const timeLabel = (d: Date) =>
  d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
export const dateTimeLabel = (d: Date) =>
  d.toLocaleString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });

const priceDigits = (n: number) => (n >= 1000 ? 0 : n >= 1 ? 2 : 4);

/** Preço com casas decimais conforme a grandeza: US$ 82.700, US$ 105,00, US$ 0,1834. */
export const usdPrice = (n: number) =>
  `US$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: priceDigits(n), maximumFractionDigits: priceDigits(n) })}`;
export const brlPrice = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: priceDigits(n), maximumFractionDigits: priceDigits(n) })}`;

export const signedPct = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

export const asOfLabel = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: TZ });

/** Tempo desde a publicação, no estilo dos portais: "há 12 min", "há 3 horas", "há 2 dias". */
export function ago(date: number, now: number) {
  const min = Math.max(0, Math.round((now - date) / 6e4));
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} ${h === 1 ? "hora" : "horas"}`;
  const d = Math.round(h / 24);
  return `há ${d} ${d === 1 ? "dia" : "dias"}`;
}
