import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getPost, blogPosts } from "@/lib/blog-posts";


export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Artículo no encontrado — Karma Financiero" }] };
    const url = `https://karmafinanciero.com/blog/${params.slug}`;
    return {
      meta: [
        { title: `${post.title} — Karma Financiero` },
        { name: "description", content: post.excerpt },
        { name: "keywords", content: post.keywords.join(", ") },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: post.cover },
        { property: "twitter:image", content: post.cover },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            keywords: post.keywords,
            datePublished: post.date,
            image: post.cover,
            author: { "@type": "Organization", name: "Karma Financiero" },
            publisher: {
              "@type": "Organization",
              name: "Karma Financiero",
              logo: {
                "@type": "ImageObject",
                url: "https://karmafinanciero.com/favicon.png",
              },
            },
            mainEntityOfPage: url,
          }),
        },
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
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <SiteHeader />


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
          {post.content.map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        <section className={`post-waitlist tone-${post.tone}`} aria-label="Lista de espera">
          <div>
            <span>Acceso anticipado</span>
            <h2>Ordena las cuentas compartidas con Karma</h2>
            <p>
              Únete a la lista de espera y recibe la primera versión para gestionar gastos,
              objetivos y presupuesto del hogar en un solo lugar.
            </p>
          </div>
          <Link className="btn-pill btn-pill-dark" to="/lista-espera">Apuntarme</Link>
        </section>

        {related.length > 0 && (
          <section className="container-x post-related">
            <h2>Sigue leyendo</h2>
            <div className="story-grid">
              {related.map((p, index) => (
                <Link
                  key={p.slug}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className={`story-card tone-${p.tone}`}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
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

      <SiteFooter />

    </>
  );
}
