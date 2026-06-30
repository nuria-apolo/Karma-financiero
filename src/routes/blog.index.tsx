import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { blogPosts } from "@/lib/blog-posts";

const APP_URL = "https://app.karmafinanciero.com/";


export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Diario de Karma — Blog de finanzas compartidas" },
      {
        name: "description",
        content:
          "Lecturas cortas sobre hablar de dinero en pareja, presupuesto del hogar y objetivos compartidos.",
      },
      { property: "og:title", content: "Diario de Karma — Blog" },
      {
        property: "og:description",
        content:
          "Ideas prácticas sobre finanzas compartidas, presupuesto del hogar y objetivos en pareja.",
      },
      { property: "og:url", content: "https://karmafinanciero.com/blog" },
    ],
    links: [{ rel: "canonical", href: "https://karmafinanciero.com/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <>
      <SiteHeader />


      <main className="blog-page">
        <section className="container-x blog-hero">
          <span className="eyebrow"><span className="dot" /> Diario de Karma</span>
          <h1>Historias de finanzas compartidas.</h1>
          <p>
            Karma acompaña a hogares que quieren hablar de dinero sin discutir.
            Aquí recogemos rituales, métodos y conversaciones reales que sostienen el hábito.
          </p>
        </section>

        <section className="container-x" style={{ paddingBottom: "5rem" }}>
          <div className="story-grid">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="story-card"
              >
                <div className="story-cover">
                  <img src={post.cover} alt={post.title} loading="lazy" width={1024} height={1024} />
                  <span className="story-year">{post.year}</span>
                </div>
                <div className="story-body">
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="story-meta">
                    <span>{post.tag} · {post.readingTime}</span>
                    <span className="arrow">Leer →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />

    </>
  );
}
