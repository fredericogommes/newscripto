export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a className="logo" href="/">
            <span className="logo-mark" aria-hidden="true">JC</span>
            <span className="logo-word">Jornal <b>Cripto</b></span>
          </a>
          <p>
            Notícias do mercado cripto escritas pela nossa redação, agenda de eventos, calculadora de risco em reais e
            alertas da sua carteira.
          </p>
        </div>
        <nav className="footer-col" aria-label="Seções">
          <b>Seções</b>
          <a href="/#noticias">Notícias</a>
          <a href="/#mercado">Mercados</a>
          <a href="/#agenda">Agenda</a>
          <a href="/#risco">Calculadora de risco</a>
          <a href="/#alertas">Alertas</a>
          <a href="/#glossario">Glossário</a>
        </nav>
        <nav className="footer-col" aria-label="Editorias">
          <b>Editorias</b>
          {["Brasil", "Bitcoin", "Ethereum", "Altcoins", "Mercados", "Regulação"].map((c) => (
            <a key={c} href="/#noticias">{c}</a>
          ))}
        </nav>
        <div className="footer-col footer-how">
          <b>Como fazemos</b>
          <p>
            A redação acompanha mais de 15 portais do Brasil e do mundo e publica matérias próprias às 8h, 12h e 20h. Cada
            matéria lista no fim as fontes consultadas. Imagens com crédito da origem. O viés da agenda é a reação que o
            mercado teve a eventos parecidos, nunca uma previsão. Não publicamos conteúdo pago nem usamos links de afiliado.
            Preços da CoinGecko e índice de Medo e Ganância da alternative.me.
          </p>
        </div>
      </div>
      <p className="footer-legal">
        Este material é informativo e educacional. Não é recomendação de investimento, oferta ou consultoria. Criptoativos
        são voláteis e você pode perder parte ou todo o valor investido. © {new Date().getFullYear()} Jornal Cripto.
      </p>
    </footer>
  );
}
