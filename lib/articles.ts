import { createClient } from "@supabase/supabase-js";
import type { Category, NewsItem } from "./rss.ts";

export interface ArticleSource {
  name: string;
  url: string;
}

export interface Article {
  slug: string;
  title: string;
  dek: string;
  body: string[];
  category: Category;
  tickers: string[];
  imageUrl: string | null;
  imageCredit: string | null;
  sources: ArticleSource[];
  author: string;
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://newscripto-omega.vercel.app").replace(/\/$/, "");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = url && anonKey ? createClient(url, anonKey) : null;

const COLUMNS =
  "slug, title, dek, body, category, tickers, image_url, image_credit, sources, author, featured, published_at, updated_at";

type Row = {
  slug: string;
  title: string;
  dek: string;
  body: string[];
  category: Category;
  tickers: string[] | null;
  image_url: string | null;
  image_credit: string | null;
  sources: unknown;
  author: string;
  featured: boolean;
  published_at: string;
  updated_at: string;
};

const isSource = (s: Partial<ArticleSource>): s is ArticleSource =>
  typeof s?.name === "string" && typeof s.url === "string" && /^https:\/\//.test(s.url);

function toArticle(r: Row): Article {
  return {
    slug: r.slug,
    title: r.title,
    dek: r.dek,
    body: r.body ?? [],
    category: r.category,
    tickers: r.tickers ?? [],
    imageUrl: r.image_url,
    imageCredit: r.image_credit,
    sources: Array.isArray(r.sources) ? r.sources.filter(isSource) : [],
    author: r.author,
    featured: r.featured,
    publishedAt: r.published_at,
    updatedAt: r.updated_at,
  };
}

/** Matérias mais recentes. Sem Supabase ou com erro, lista vazia (a capa volta às manchetes dos portais). */
export async function getArticles(limit = 60): Promise<Article[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("articles")
    .select(COLUMNS)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as Row[]).map(toArticle);
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (!supabase || !/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  const { data, error } = await supabase.from("articles").select(COLUMNS).eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return toArticle(data as Row);
}

export const articlePath = (slug: string) => `/noticias/${slug}`;

/** Adapta a matéria ao formato dos cards da capa. */
export function asNewsItem(a: Article): NewsItem {
  return {
    title: a.title,
    link: articlePath(a.slug),
    source: "Jornal Cripto",
    region: "Brasil",
    publishedAt: a.publishedAt,
    tickers: a.tickers,
    category: a.category,
    image: a.imageUrl ?? undefined,
    summary: a.dek,
    author: a.author,
  };
}

export const readingMinutes = (a: Article) =>
  Math.max(1, Math.round(a.body.join(" ").split(/\s+/).length / 200));
