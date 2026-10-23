-- Boletim escrito pelo agente agendado (8h, 12h e 20h, horário de Brasília).
create table public.news_editions (
  id bigint generated always as identity primary key,
  slot text not null check (slot in ('08h', '12h', '20h', 'extra')),
  published_at timestamptz not null default now(),
  headline text not null,
  -- [{ "tag": "Regulação", "title": "...", "body": "...", "source": "Livecoins", "url": "https://..." }]
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 12),
  sources_checked text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index news_editions_published_idx on public.news_editions (published_at desc);
alter table public.news_editions enable row level security;
create policy "boletim é público para leitura" on public.news_editions for select to anon, authenticated using (true);
