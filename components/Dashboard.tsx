"use client";

import { useEffect, useMemo, useState } from "react";
import type { AssetProfile, MarketEvent, Position } from "@/lib/types.ts";
import { analyzePortfolio, eventTouches } from "@/lib/risk.ts";
import Agenda from "./Agenda.tsx";
import RiskCalculator from "./RiskCalculator.tsx";
import AlertPreview from "./AlertPreview.tsx";

const SAMPLE: Position[] = [
  { ticker: "BTC", valueBrl: 15000 },
  { ticker: "SOL", valueBrl: 10000 },
];
const STORAGE_KEY = "jornal-cripto-posicoes";

export default function Dashboard({
  events,
  profiles,
  renderedAt,
}: {
  events: MarketEvent[];
  profiles: AssetProfile[];
  renderedAt: number;
}) {
  const profileMap = useMemo(() => Object.fromEntries(profiles.map((p) => [p.ticker, p])), [profiles]);
  const [positions, setPositions] = useState<Position[]>(SAMPLE);
  const [now, setNow] = useState(renderedAt);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (Array.isArray(saved)) setPositions(saved);
    } catch {}
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const update = (next: Position[]) => {
    setPositions(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const report = useMemo(() => analyzePortfolio(positions, profileMap), [positions, profileMap]);
  const held = useMemo(() => (report ? report.holdings.map((h) => h.ticker) : []), [report]);
  const upcoming = useMemo(
    () =>
      events.filter(
        (e) =>
          Date.parse(e.startsAt) > now &&
          Date.parse(e.startsAt) - now < 14 * 864e5 &&
          eventTouches(e, held, profileMap),
      ),
    [events, held, profileMap, now],
  );

  return (
    <>
      <Agenda events={events} held={held} profiles={profileMap} now={now} />
      <RiskCalculator
        positions={positions}
        profiles={profiles}
        report={report}
        upcoming={upcoming}
        now={now}
        onChange={update}
        onReset={() => update(SAMPLE)}
      />
      <AlertPreview report={report} event={upcoming[0] ?? events.find((e) => Date.parse(e.startsAt) > now)} />
    </>
  );
}
