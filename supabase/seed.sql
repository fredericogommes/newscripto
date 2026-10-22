-- Dados iniciais: perfis de risco aproximados e a agenda compilada dos relatórios diários de 15 a 22/10/2026.

insert into asset_profiles (ticker, name, annual_vol, beta_btc, is_stable) values
  ('BTC', 'Bitcoin', 0.45, 1.0, false),
  ('ETH', 'Ethereum', 0.65, 1.3, false),
  ('SOL', 'Solana', 0.80, 1.5, false),
  ('XRP', 'XRP', 0.75, 1.3, false),
  ('BNB', 'BNB', 0.55, 0.9, false),
  ('ADA', 'Cardano', 0.80, 1.5, false),
  ('DOGE', 'Dogecoin', 0.95, 1.7, false),
  ('LINK', 'Chainlink', 0.85, 1.5, false),
  ('AVAX', 'Avalanche', 0.90, 1.6, false),
  ('DOT', 'Polkadot', 0.85, 1.5, false),
  ('USDT', 'Tether', 0.01, 0, true),
  ('USDC', 'USD Coin', 0.01, 0, true),
  ('OUTRO', 'Outro ativo', 1.00, 1.6, false);

insert into events (slug, category, title, description, note, starts_at, all_day, time_confirmed, assets, bias, bias_label, status) values
  ('zro-unlock-2026-10-20', 'unlock', 'Desbloqueio do ZRO', 'Cerca de US$ 57 mi em tokens LayerZero liberados.', 'Desbloqueios grandes costumam pesar no preço nos dias em torno da data.', '2026-10-20 00:00-03', true, false, '{ZRO}', 'down', 'Pressão vendedora', 'confirmado'),
  ('sol-alpenglow', 'rede', 'Solana Alpenglow na rede principal', 'Maior reformulação do consenso desde 2020. Confirmação final caiu para 150 ms.', 'Reação observada: SOL foi de US$ 106 para US$ 105 (−0,7%) nas 24 h seguintes.', '2026-10-21 00:00-03', true, true, '{SOL}', 'vol', 'Volatilidade', 'confirmado'),
  ('ake-unlock-2026-10-21', 'unlock', 'Desbloqueio do AKE', 'Cerca de US$ 65 mi em tokens liberados.', '', '2026-10-21 00:00-03', true, false, '{AKE}', 'down', 'Pressão vendedora', 'confirmado'),
  ('us-pmi-2026-10-23', 'macro', 'PMIs preliminares dos EUA', 'Termômetro de atividade de indústria e serviços em outubro.', 'Dado acima do esperado tende a fortalecer o dólar, o que historicamente pesa sobre cripto.', '2026-10-23 10:45-03', false, false, '{*}', 'vol', 'Volatilidade pontual', 'confirmado'),
  ('fomc-2026-10-28', 'macro', 'Decisão de juros do Fed', 'Reunião de 27 e 28/10, com coletiva às 15h30.', 'A direção costuma depender da surpresa em relação ao esperado, não da decisão em si.', '2026-10-28 15:00-03', false, false, '{*}', 'vol', 'Volatilidade alta', 'confirmado'),
  ('strategy-vote-2026-10-28', 'macro', 'Votação dos acionistas da Strategy', 'Assembleia da maior empresa com bitcoin em caixa.', 'Afeta mais a ação MSTR que o BTC diretamente.', '2026-10-28 00:00-03', true, false, '{BTC}', 'neu', 'Neutro', 'confirmado'),
  ('ripio-br-2026-10-29', 'reg', 'Ripio encerra Pix e negociação no Brasil', 'Clientes precisam sacar ou transferir os saldos antes.', 'Sem efeito esperado no preço; é um prazo para quem usa a corretora.', '2026-10-29 00:00-03', true, true, '{BR}', 'neu', 'Operacional', 'confirmado'),
  ('ar-exchanges-2026-11-01', 'reg', 'Argentina: novas regras para corretoras', 'Exigência de dados de investidores e proibição de mixers.', 'Impacto regional.', '2026-11-01 00:00-03', true, true, '{*}', 'neu', 'Neutro', 'confirmado'),
  ('msci-2026-11-11', 'macro', 'Revisão de índices do MSCI', 'Lista que pode afetar empresas com cripto em caixa.', 'Citado no relatório de 16/10.', '2026-11-11 00:00-03', true, false, '{BTC}', 'vol', 'Volatilidade', 'confirmado'),
  ('genius-act-2027-01-18', 'reg', 'Regras das stablecoins entram em vigor nos EUA', 'Regulamentação final do GENIUS Act pelo OCC.', 'Clareza regulatória costuma ser lida como positiva no longo prazo.', '2027-01-18 00:00-03', true, true, '{USDT,USDC,ETH,SOL}', 'up', 'Positivo estrutural', 'confirmado');
