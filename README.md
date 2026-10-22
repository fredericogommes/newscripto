# Jornal Cripto

Portal informativo sobre o mercado cripto: agenda de eventos que movem o mercado (atualizações de rede, desbloqueios de tokens, macro e regulação), calculadora de risco por carteira em reais e alertas por WhatsApp e webhook.

Conteúdo estritamente informativo. Nada aqui é recomendação de investimento.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # opcional: sem Supabase, o site usa a agenda de exemplo
npm run dev
npm test                     # testes do cálculo de risco
```

## Supabase

1. Crie um projeto no Supabase.
2. Rode `supabase/migrations/0001_init.sql` e depois `supabase/seed.sql` no SQL Editor (ou `supabase db push`).
3. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no `.env.local` e nas variáveis do projeto na Vercel.

Só eventos com `status = 'confirmado'` aparecem no site e geram alertas. Coletores gravam como `pendente`.

## Estrutura

- `app/`: páginas (Next.js App Router).
- `components/`: agenda, calculadora de risco e prévia dos alertas.
- `lib/risk.ts`: cálculo de risco (volatilidade, VaR 95%, cenários de queda do BTC), com testes em `lib/risk.test.ts`.
- `lib/data.ts`: leitura do Supabase, com fallback para `lib/sample-data.ts`.
- `supabase/`: tabelas, políticas de acesso e dados iniciais.

## Deploy na Vercel

Importe o repositório na Vercel, configure as duas variáveis do Supabase e publique. A página regenera a cada 5 minutos.
