import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import karmaLogo from "@/assets/karma-logo.svg.asset.json";
import { getPost, blogPosts } from "@/lib/blog-posts";

const APP_URL = "https://app.karmafinanciero.com/";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Artículo no encontrado — Karma Financiero" }] };
    return {
      meta: [
        { title: `${post.title} — Karma Financiero` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-x section">
      <h1>Artículo no encontrado</h1>
      <p className="sublead" style={{ marginTop: "1rem" }}>
        Puede que el enlace esté roto o el post haya cambiado de sitio.
      </p>
      <Link to="/blog" className="btn btn-soft" style={{ marginTop: "1.5rem" }}>Volver al blog</Link>
    </div>
  ),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

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
        <article className="section">
          <div className="container-x" style={{ maxWidth: "760px" }}>
            <div className="eyebrow"><span className="dot"></span> {post.tag}</div>
            <h1 style={{ marginTop: "1.2rem", fontSize: "clamp(2.4rem, 5vw, 4.2rem)", maxWidth: "20ch" }}>
              {post.title}
            </h1>
            <p className="sublead" style={{ marginTop: "1.2rem" }}>
              {post.date} · {post.readingTime} de lectura
            </p>

            <div style={{ marginTop: "2.5rem", display: "grid", gap: "1.3rem", fontSize: "var(--text-lg)", lineHeight: 1.65 }}>
              {post.content.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="cta-box" style={{ marginTop: "3rem" }}>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>Pruébalo en tu hogar</h2>
              <p>Abre Karma Financiero y empieza a llevar las cuentas compartidas con un poco más de calma.</p>
              <a className="btn btn-primary" href={APP_URL} target="_blank" rel="noopener noreferrer">Abrir la app</a>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="container-x">
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>Sigue leyendo</h2>
              <div className="feature-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                {related.map((p) => (
                  <article key={p.slug} className="panel">
                    <div className="eyebrow" style={{ marginBottom: "1rem" }}>{p.tag}</div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", lineHeight: 1.1, marginBottom: "0.6rem" }}>
                      {p.title}
                    </h3>
                    <p>{p.excerpt}</p>
                    <div style={{ marginTop: "1.2rem" }}>
                      <Link to="/blog/$slug" params={{ slug: p.slug }} style={{ fontWeight: 600 }}>
                        Leer →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
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
