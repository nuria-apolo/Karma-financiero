import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import type { BlogCategoryRow, BlogPostRow } from "@/lib/blog-cms";
import {
  FALLBACK_BLOG_IMAGE,
  fetchPublishedPosts,
  getCategoryName,
  getPostTone,
  getPostYear,
  readingTime,
} from "@/lib/blog-cms";
import { buildSeoHead, fetchSeoPage } from "@/lib/seo-cms";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const [blogData, seo] = await Promise.all([fetchPublishedPosts(), fetchSeoPage("/blog")]);
    return { ...blogData, seo };
  },
  headers: () => ({
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "CDN-Cache-Control": "no-store",
    "Cloudflare-CDN-Cache-Control": "no-store",
  }),
  head: ({ loaderData }) => {
    const posts = loaderData?.posts ?? [];
    const categories = loaderData?.categories ?? [];
    const blogListJsonLd = {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Diario de Karma — Blog de finanzas compartidas",
      description:
        "Lecturas cortas sobre hablar de dinero en pareja, presupuesto del hogar y objetivos compartidos.",
      url: "https://karmafinanciero.com/blog",
      blogPosts: posts.map((post) => ({
        "@type": "BlogPosting",
        headline: post.seo_title || post.title,
        description: post.seo_description || post.excerpt,
        url: `https://karmafinanciero.com/blog/${post.slug}`,
        datePublished: post.published_at,
        dateModified: post.updated_at,
        image: new URL(post.featured_image || FALLBACK_BLOG_IMAGE, "https://karmafinanciero.com")
          .href,
        articleSection: getCategoryName(categories, post.category),
        author: { "@type": "Organization", name: "Karma Financiero" },
      })),
    };
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: "https://karmafinanciero.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: "https://karmafinanciero.com/blog",
        },
      ],
    };

    return buildSeoHead({
      seo: loaderData?.seo,
      defaults: {
        path: "/blog",
        title: "Diario de Karma — Blog de finanzas compartidas",
        description:
          "Lecturas cortas sobre hablar de dinero en pareja, presupuesto del hogar y objetivos compartidos.",
        image: "/head-icon.png",
      },
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(blogListJsonLd),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbJsonLd),
        },
      ],
    });
  },
  component: BlogIndex,
});

function BlogIndex() {
  const loaderData = Route.useLoaderData();
  const [posts, setPosts] = useState<BlogPostRow[]>(loaderData.posts);
  const [categories, setCategories] = useState<BlogCategoryRow[]>(loaderData.categories);

  useEffect(() => {
    if (loaderData.posts.length > 0) return;

    let active = true;
    void fetchPublishedPosts().then((data) => {
      if (!active) return;
      setPosts(data.posts);
      setCategories(data.categories);
    });

    return () => {
      active = false;
    };
  }, [loaderData]);

  const [featuredPost, ...morePosts]: typeof posts = posts;

  return (
    <>
      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="blog-page">
        <section className="container-x blog-hero">
          <div>
            <nav className="post-breadcrumb" aria-label="Migas de pan">
              <Link to="/">Inicio</Link>
              <span aria-hidden="true">/</span>
              <span>Blog</span>
            </nav>
            <span className="eyebrow">
              <span className="dot" /> Diario de Karma
            </span>
            <h1>Blog de finanzas compartidas para hogares reales.</h1>
          </div>
          <p>
            Guías prácticas para hablar de dinero en pareja, organizar gastos del hogar, crear un
            presupuesto familiar y convertir objetivos compartidos en decisiones concretas.
          </p>
        </section>

        <section className="container-x blog-stories">
          {featuredPost && (
            <Link
              to="/blog/$slug"
              params={{ slug: featuredPost.slug }}
              className={`story-featured tone-${getPostTone(featuredPost.category)}`}
            >
              <div className="story-featured-copy">
                <span>
                  {getCategoryName(categories, featuredPost.category)} ·{" "}
                  {readingTime(featuredPost.content)}
                </span>
                <h2>{featuredPost.title}</h2>
                <p>{featuredPost.excerpt}</p>
                <strong>Leer artículo</strong>
              </div>
              <div className="story-featured-cover">
                <img
                  src={featuredPost.featured_image || FALLBACK_BLOG_IMAGE}
                  alt={`Ilustración del artículo: ${featuredPost.title}`}
                  width={1200}
                  height={900}
                />
                <span className="story-year">{getPostYear(featuredPost.published_at)}</span>
              </div>
            </Link>
          )}

          {posts.length === 0 && (
            <div className="blog-empty">
              <h2>Estamos preparando nuevas lecturas.</h2>
              <p>Vuelve pronto para leer ideas sobre finanzas compartidas, hogar y calma.</p>
            </div>
          )}

          <div className="story-grid">
            {morePosts.map((post, index) => (
              <Link
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className={`story-card tone-${getPostTone(post.category, index + 1)}`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="story-cover">
                  <img
                    src={post.featured_image || FALLBACK_BLOG_IMAGE}
                    alt={`Ilustración del artículo: ${post.title}`}
                    loading="lazy"
                    width={1024}
                    height={1024}
                  />
                  <span className="story-year">{getPostYear(post.published_at)}</span>
                </div>
                <div className="story-body">
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="story-meta">
                    <span>
                      {getCategoryName(categories, post.category)} · {readingTime(post.content)}
                    </span>
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
