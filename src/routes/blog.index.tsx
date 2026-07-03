import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { blogPosts } from "@/lib/blog-posts";

export const Route = createFileRoute("/blog/")({
  head: () => {
    const blogListJsonLd = {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Diario de Karma — Blog de finanzas compartidas",
      description: "Lecturas cortas sobre hablar de dinero en pareja, presupuesto del hogar y objetivos compartidos.",
      url: "https://karmafinanciero.com/blog",
      blogPosts: blogPosts.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        url: `https://karmafinanciero.com/blog/${post.slug}`,
        datePublished: post.isoDate,
        image: post.cover,
        author: { "@type": "Organization", name: "Karma Financiero" },
      })),
    };

    return {
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
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(blogListJsonLd),
        },
      ],
    };
  },
  component: BlogIndex,
});

function BlogIndex() {
  const [featuredPost, ...morePosts] = blogPosts;

  return (
    <>
      <SiteHeader />


      <main className="blog-page">
        <section className="container-x blog-hero">
          <div>
            <span className="eyebrow"><span className="dot" /> Diario de Karma</span>
            <h1>Historias de finanzas compartidas.</h1>
          </div>
          <p>
            Ideas cortas para hablar de dinero con más calma: rituales, presupuesto,
            objetivos y pequeñas decisiones que sostienen el hogar.
          </p>
        </section>

        <section className="container-x blog-stories">
          {featuredPost && (
            <Link
              to="/blog/$slug"
              params={{ slug: featuredPost.slug }}
              className={`story-featured tone-${featuredPost.tone}`}
            >
              <div className="story-featured-copy">
                <span>{featuredPost.tag} · {featuredPost.readingTime}</span>
                <h2>{featuredPost.title}</h2>
                <p>{featuredPost.excerpt}</p>
                <strong>Leer artículo</strong>
              </div>
              <div className="story-featured-cover">
                <img src={featuredPost.cover} alt={featuredPost.title} width={1200} height={900} />
                <span className="story-year">{featuredPost.year}</span>
              </div>
            </Link>
          )}

          <div className="story-grid">
            {morePosts.map((post, index) => (
              <Link
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className={`story-card tone-${post.tone}`}
                style={{ animationDelay: `${index * 70}ms` }}
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
