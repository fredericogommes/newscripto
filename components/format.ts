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
