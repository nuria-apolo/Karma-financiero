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
        { property: "og:image", content: post.cover },
        { property: "twitter:image", content: post.cover },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-x section">
      <h1>Artículo no encontrado</h1>
      <p style={{ marginTop: "1rem", color: "var(--muted)" }}>
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
        <div className="nav-pill">
          <Link to="/" aria-label="Karma Financiero">
            <img src={karmaLogo.url} alt="Karma Financiero" className="brand-logo" />
          </Link>
          <nav className="nav-links" aria-label="Principal">
            <Link to="/" hash="features">Funciones</Link>
            <Link to="/" hash="beneficios">Beneficios</Link>
            <Link to="/" hash="planes">Planes</Link>
            <Link to="/blog">Blog</Link>
          </nav>
          <a className="nav-cta" href={APP_URL} target="_blank" rel="noopener noreferrer">
            Probar gratis
          </a>
        </div>
      </header>

      <main className="post-page">
        <div className="container-x" style={{ marginBottom: "1.5rem" }}>
          <Link to="/blog" className="back-link">← Volver al diario</Link>
        </div>

        <div className="post-cover">
          <img src={post.cover} alt={post.title} width={1600} height={900} />
          <span className="story-year">{post.year}</span>
        </div>

        <header className="post-head">
          <span className="eyebrow"><span className="dot" /> {post.tag}</span>
          <h1>{post.title}</h1>
          <p className="post-meta">{post.date} · {post.readingTime} de lectura</p>
        </header>

        <article className="post-content">
          {post.content.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        <section className="section">
          <div className="container-x">
            <div className="cta-box">
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>Pruébalo en tu hogar</h2>
              <p>Abre Karma Financiero y empieza a llevar las cuentas compartidas con un poco más de calma.</p>
              <a className="btn btn-primary" href={APP_URL} target="_blank" rel="noopener noreferrer">Abrir la app</a>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="container-x" style={{ paddingBottom: "5rem" }}>
            <h2 style={{
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)", marginBottom: "1.5rem", textAlign: "center"
            }}>
              Sigue leyendo
            </h2>
            <div className="story-grid">
              {related.map((p) => (
                <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="story-card">
                  <div className="story-cover">
                    <img src={p.cover} alt={p.title} loading="lazy" width={1024} height={1024} />
                    <span className="story-year">{p.year}</span>
                  </div>
                  <div className="story-body">
                    <h3>{p.title}</h3>
                    <p>{p.excerpt}</p>
                    <div className="story-meta">
                      <span>{p.tag} · {p.readingTime}</span>
                      <span className="arrow">Leer →</span>
                    </div>
                  </div>
                </Link>
              ))}
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
