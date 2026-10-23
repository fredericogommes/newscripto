-- Matérias próprias do Jornal Cripto, escritas pelo agente agendado a partir da apuração nos portais.
create table public.articles (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  title text not null check (length(title) between 10 and 140),
  dek text not null check (length(dek) between 20 and 300),
  -- Parágrafos em texto puro; o site não interpreta HTML.
  body text[] not null check (array_length(body, 1) between 3 and 30),
  category text not null check (category in ('Bitcoin','Ethereum','Altcoins','Mercados','Regulação','Brasil','Blockchain','Segurança','Macro')),
  tickers text[] not null default '{}',
  image_url text check (image_url is null or image_url ~ '^https://'),
  image_credit text,
  -- [{ "name": "CoinDesk", "url": "https://..." }]: fontes consultadas, listadas no fim da matéria
  sources jsonb not null default '[]' check (jsonb_typeof(sources) = 'array'),
  author text not null default 'Redação Jornal Cripto',
  featured boolean not null default false,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index articles_published_idx on public.articles (published_at desc);
alter table public.articles enable row level security;
create policy "matérias são públicas para leitura" on public.articles for select to anon, authenticated using (true);
