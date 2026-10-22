-- Jornal Cripto: agenda de eventos, perfis de risco por ativo, carteiras e fila de alertas.

create type event_category as enum ('rede', 'unlock', 'macro', 'reg');
create type event_bias as enum ('up', 'down', 'vol', 'neu');
create type event_status as enum ('pendente', 'confirmado', 'cancelado');

-- Eventos da agenda. Coletores gravam como 'pendente'; só 'confirmado' aparece no site e gera alerta.
create table events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category event_category not null,
  title text not null,
  description text not null default '',
  note text not null default '',
  starts_at timestamptz not null,
  all_day boolean not null default false,
  time_confirmed boolean not null default false,
  -- Tickers afetados. '*' = todo o mercado (exceto stablecoins); 'BR' = usuários no Brasil.
  assets text[] not null default '{}',
  bias event_bias not null default 'neu',
  bias_label text not null default '',
  source_url text,
  status event_status not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index events_starts_at_idx on events (starts_at) where status = 'confirmado';

-- Premissas da calculadora. Na etapa 2 a volatilidade passa a ser recalculada com 90 dias de preços.
create table asset_profiles (
  ticker text primary key,
  name text not null,
  annual_vol numeric not null check (annual_vol >= 0),
  beta_btc numeric not null,
  is_stable boolean not null default false
);

create table portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Minha carteira',
  created_at timestamptz not null default now()
);

create table positions (
  portfolio_id uuid not null references portfolios (id) on delete cascade,
  ticker text not null references asset_profiles (ticker),
  value_brl numeric not null check (value_brl >= 0),
  primary key (portfolio_id, ticker)
);

-- Canais de alerta do usuário. O segredo do webhook assina o corpo com HMAC-SHA256.
create table alert_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('whatsapp', 'webhook')),
  target text not null,
  webhook_secret text,
  consent_at timestamptz not null,
  active boolean not null default true
);

-- Fila de avisos. A chave única impede envio duplicado se o job reiniciar.
create table alert_queue (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text unique not null,
  channel_id uuid not null references alert_channels (id) on delete cascade,
  payload jsonb not null,
  send_after timestamptz not null,
  sent_at timestamptz,
  attempts int not null default 0,
  last_error text
);

alter table events enable row level security;
alter table asset_profiles enable row level security;
alter table portfolios enable row level security;
alter table positions enable row level security;
alter table alert_channels enable row level security;
alter table alert_queue enable row level security;

create policy "agenda pública" on events for select using (status = 'confirmado');
create policy "perfis públicos" on asset_profiles for select using (true);
create policy "dono da carteira" on portfolios for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dono das posições" on positions for all
  using (exists (select 1 from portfolios p where p.id = portfolio_id and p.user_id = auth.uid()))
  with check (exists (select 1 from portfolios p where p.id = portfolio_id and p.user_id = auth.uid()));
create policy "dono dos canais" on alert_channels for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- alert_queue fica sem política: só o service role (motor de alertas) acessa.
