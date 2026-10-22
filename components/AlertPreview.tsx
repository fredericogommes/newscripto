import type { MarketEvent } from "@/lib/types.ts";
import type { RiskReport } from "@/lib/risk.ts";
import { brl, dateTimeLabel } from "./format.ts";

const DISCLAIMER = "Informativo. Não é recomendação de investimento.";

export default function AlertPreview({ report, event }: { report: RiskReport | null; event?: MarketEvent }) {
  let whatsapp = "Adicione posições para ver a prévia.";
  let webhook: object = {};

  if (report && !event) whatsapp = "Nenhum evento futuro na agenda.";
  if (report && event) {
    const exposed = report.holdings.filter((h) =>
      event.assets.includes("*") ? h.dailyVol > 0.001 : event.assets.includes(h.ticker),
    );
    const exposedBrl = exposed.reduce((s, h) => s + h.valueBrl, 0);
    whatsapp = [
      "📅 *Jornal Cripto · Alerta de agenda*",
      "",
      `*${event.title}*`,
      `${dateTimeLabel(new Date(event.startsAt))}${event.timeConfirmed ? "" : " (horário aproximado)"}`,
      "",
      `Sua exposição: ${brl(exposedBrl)} (${exposed.map((h) => h.ticker).join(", ") || "nenhum ativo direto"})`,
      `Reação histórica: ${event.biasLabel.toLowerCase()}`,
      `Risco da carteira: ${report.band.toLowerCase()} (${report.score}/100)`,
      `Perda em dia ruim (VaR 95%): ${brl(report.var95DayBrl)}`,
      "",
      `_${DISCLAIMER}_`,
    ].join("\n");
    webhook = {
      type: "event.upcoming",
      lead_time: "24h",
      event: {
        id: event.slug,
        title: event.title,
        category: event.category,
        starts_at: event.startsAt,
        time_confirmed: event.timeConfirmed,
        assets: event.assets,
        historical_bias: event.bias,
      },
      portfolio: {
        total_brl: Math.round(report.totalBrl),
        exposed_brl: Math.round(exposedBrl),
        risk_score: report.score,
        var95_1d_brl: Math.round(report.var95DayBrl),
      },
      disclaimer: DISCLAIMER,
    };
  }

  return (
    <section className="section" id="alertas">
      <div className="section-head">
        <p className="eyebrow">Alertas recorrentes · prévia</p>
        <h2>O aviso que você receberia com essa carteira</h2>
        <p className="meta">O serviço vai cruzar suas posições com a agenda e avisar 24 h e 1 h antes de cada evento, e também quando o risco da carteira mudar de faixa.</p>
      </div>
      <div className="alerts">
        <div className="panel">
          <h3>WhatsApp</h3>
          <div className="wa">{whatsapp}</div>
          <p className="soon">O envio ainda não está ativo. Esta é a prévia do formato.</p>
        </div>
        <div className="panel">
          <h3>Webhook (JSON enviado por POST)</h3>
          <pre className="json">{JSON.stringify(webhook, null, 2)}</pre>
        </div>
      </div>
    </section>
  );
}
