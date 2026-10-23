import SiteFooter from "@/components/SiteFooter.tsx";

export default function NotFound() {
  return (
    <>
      <main className="wrap">
        <section className="section">
          <h1>Matéria não encontrada</h1>
          <p className="meta">O endereço pode ter mudado. Veja as notícias mais recentes na capa.</p>
          <p><a className="btn" href="/">Voltar para a capa</a></p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
