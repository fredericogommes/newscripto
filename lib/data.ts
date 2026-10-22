import { createClient } from "@supabase/supabase-js";
import type { AssetProfile, MarketEvent } from "./types.ts";
import { SAMPLE_EVENTS, SAMPLE_PROFILES } from "./sample-data.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = url && anonKey ? createClient(url, anonKey) : null;

/** Eventos confirmados, do mais antigo ao mais recente. Sem Supabase, devolve a agenda de exemplo. */
export async function getEvents(): Promise<MarketEvent[]> {
  if (!supabase) return SAMPLE_EVENTS;
  const { data, error } = await supabase
    .from("events")
    .select("slug, category, title, description, note, starts_at, all_day, time_confirmed, assets, bias, bias_label")
    .eq("status", "confirmado")
    .order("starts_at");
  if (error) throw new Error(`Falha ao ler a agenda: ${error.message}`);
  return data.map((e) => ({
    slug: e.slug,
    category: e.category,
    title: e.title,
    description: e.description,
    note: e.note,
    startsAt: e.starts_at,
    allDay: e.all_day,
    timeConfirmed: e.time_confirmed,
    assets: e.assets,
    bias: e.bias,
    biasLabel: e.bias_label,
  }));
}

export async function getProfiles(): Promise<AssetProfile[]> {
  if (!supabase) return SAMPLE_PROFILES;
  const { data, error } = await supabase
    .from("asset_profiles")
    .select("ticker, name, annual_vol, beta_btc, is_stable")
    .order("ticker");
  if (error) throw new Error(`Falha ao ler os perfis de risco: ${error.message}`);
  return data.map((p) => ({
    ticker: p.ticker,
    name: p.name,
    annualVol: Number(p.annual_vol),
    betaBtc: Number(p.beta_btc),
    isStable: p.is_stable,
  }));
}
