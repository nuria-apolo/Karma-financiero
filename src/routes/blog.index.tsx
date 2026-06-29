import { createFileRoute, Link } from "@tanstack/react-router";
import karmaLogo from "@/assets/karma-logo.svg.asset.json";
import { blogPosts } from "@/lib/blog-posts";

const APP_URL = "https://app.karmafinanciero.com/";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Karma Financiero" },
      {
        name: "description",
        content:
          "Ideas y rituales prácticos para hablar de dinero en pareja, montar un presupuesto del hogar y alcanzar objetivos compartidos con calma.",
      },
      { property: "og:title", content: "Blog — Karma Financiero" },
      {
        property: "og:description",
        content:
          "Ideas prácticas sobre finanzas compartidas, presupuesto del hogar y objetivos en pareja.",
      },
    ],
  }),
  component: BlogIndex,
});

const toneClass: Record<string, string> = {
  green: "soft-green",
  yellow: "soft-yellow",
  blue: "soft-blue",
};

function BlogIndex() {
  return (
    <>
      <header className="site-header">
        <div className="container-x nav">
          <Link to="/" className="brand" aria-label="Karma Financiero">
            <img src={karmaLogo.url} alt="Karma Financiero" className="brand-logo" />
          </Link>
          <nav className="nav-links" aria-label="Principal">
            <Link to="/" hash="como-funciona">Cómo funciona</Link>
            <Link to="/" hash="beneficios">Beneficios</Link>
            <Link to="/" hash="planes">Planes</Link>
            <Link to="/blog">Blog</Link>
          </nav>
          <div className="btns">
            <a className="btn btn-soft" href={APP_URL} target="_blank" rel="noopener noreferrer">Ver app</a>
            <a className="btn btn-primary" href={APP_URL} target="_blank" rel="noopener noreferrer">Empieza gratis</a>
          </div>
        </div>
      </header>

      <main>
        <section className="section">
          <div className="container-x">
            <div className="eyebrow"><span className="dot"></span> Diario de Karma</div>
            <h1 style={{ marginTop: "1rem" }}>El blog de las finanzas compartidas.</h1>
            <p className="sublead" style={{ marginTop: "1rem", maxWidth: "55ch" }}>
              Lecturas cortas sobre cómo hablar de dinero en casa, montar un presupuesto que dure y construir objetivos comunes sin agotar la conversación.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container-x">
            <div className="feature-grid">
              {blogPosts.map((post) => (
                <article key={post.slug} className={`panel ${toneClass[post.tone]}`}>
                  <div className="eyebrow" style={{ marginBottom: "1rem" }}>{post.tag}</div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", lineHeight: 1.1, marginBottom: "0.8rem" }}>
                    {post.title}
                  </h3>
                  <p>{post.excerpt}</p>
                  <div style={{ marginTop: "1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-sm)", color: "var(--muted)" }}>
                    <span>{post.date} · {post.readingTime}</span>
                    <Link to="/blog/$slug" params={{ slug: post.slug }} style={{ fontWeight: 600, color: "var(--text)" }}>
                      Leer →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container-x footer-grid">
          <div>Karma Financiero — Finanzas compartidas con calma.</div>
          <a href={APP_URL} target="_blank" rel="noopener noreferrer">app.karmafinanciero.com</a>
        </div>
      </footer>
    </>
  );
}
