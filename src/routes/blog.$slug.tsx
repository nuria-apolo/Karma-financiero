import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BlogContent, getBlogHeadings } from "@/components/blog/BlogContent";
import type { BlogCategoryRow, BlogPostRow } from "@/lib/blog-cms";
import {
  FALLBACK_BLOG_IMAGE,
  fetchPublishedPost,
  fetchPublishedPosts,
  formatPostDate,
  getCategoryName,
  getPostTone,
  getPostYear,
  readingTime,
} from "@/lib/blog-cms";
import { buildSeoHead, fetchSeoPage } from "@/lib/seo-cms";

const RELATED_BY_SLUG: Record<string, string[]> = {
  "hablar-de-dinero-en-pareja": [
    "cuentas-comunes-sin-perder-independencia",
    "reunion-financiera-de-quince-minutos",
    "presupuesto-hogar-sin-estres",
  ],
  "cuentas-comunes-sin-perder-independencia": [
    "hablar-de-dinero-en-pareja",
    "gastos-invisibles-del-hogar",
    "objetivos-financieros-compartidos",
  ],
  "gastos-invisibles-del-hogar": [
    "presupuesto-hogar-sin-estres",
    "reunion-financiera-de-quince-minutos",
    "cuentas-comunes-sin-perder-independencia",
  ],
  "presupuesto-hogar-sin-estres": [
    "gastos-invisibles-del-hogar",
    "reunion-financiera-de-quince-minutos",
    "objetivos-financieros-compartidos",
  ],
  "objetivos-financieros-compartidos": [
    "presupuesto-hogar-sin-estres",
    "cuentas-comunes-sin-perder-independencia",
    "hablar-de-dinero-en-pareja",
  ],
  "reunion-financiera-de-quince-minutos": [
    "hablar-de-dinero-en-pareja",
    "presupuesto-hogar-sin-estres",
    "gastos-invisibles-del-hogar",
  ],
};

function selectRelatedPosts(posts: BlogPostRow[], slug: string) {
  const preferred = RELATED_BY_SLUG[slug] ?? [];
  const preferredPosts = preferred
    .map((itemSlug) => posts.find((post) => post.slug === itemSlug))
    .filter(Boolean) as BlogPostRow[];
  const fallbackPosts = posts.filter(
    (post) => post.slug !== slug && !preferred.includes(post.slug),
  );

  return [...preferredPosts, ...fallbackPosts].slice(0, 3);
}

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const [{ post, categories }, { posts }, seo] = await Promise.all([
      fetchPublishedPost(params.slug),
      fetchPublishedPosts(),
      fetchSeoPage(`/blog/${params.slug}`),
    ]);
    return {
      post,
      categories,
      seo,
      related: selectRelatedPosts(posts, params.slug),
    };
  },
  headers: () => ({
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "CDN-Cache-Control": "no-store",
    "Cloudflare-CDN-Cache-Control": "no-store",
  }),
  head: ({ params, loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Artículo no encontrado — Karma Financiero" }] };
    const rawImage = post.featured_image || FALLBACK_BLOG_IMAGE;
    const image = new URL(rawImage, "https://karmafinanciero.com").href;
    const description = post.seo_description || post.excerpt;
    const url = `https://karmafinanciero.com/blog/${params.slug}`;
    return buildSeoHead({
      seo: loaderData?.seo,
      defaults: {
        path: `/blog/${params.slug}`,
        title: post.seo_title || post.title,
        description,
        image,
        type: "article",
      },
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            image,
            author: { "@type": "Organization", name: post.author || "Karma Financiero" },
            publisher: {
              "@type": "Organization",
              name: "Karma Financiero",
              logo: {
                "@type": "ImageObject",
                url: "https://karmafinanciero.com/head-icon.png",
              },
            },
            articleSection: getCategoryName(loaderData.categories, post.category),
            inLanguage: "es",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": url,
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
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
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: url,
              },
            ],
          }),
        },
      ],
    });
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const loaderData = Route.useLoaderData();
  const { slug } = Route.useParams();
  const [post, setPost] = useState<BlogPostRow | null>(loaderData.post);
  const [categories, setCategories] = useState<BlogCategoryRow[]>(loaderData.categories);
  const [related, setRelated] = useState<BlogPostRow[]>(loaderData.related);

  const [clientChecked, setClientChecked] = useState(Boolean(loaderData.post));

  // Sync state when the route param (slug) changes — TanStack re-runs the loader
  // on navigation, but useState initializers only run once.
  useEffect(() => {
    setPost(loaderData.post);
    setCategories(loaderData.categories);
    setRelated(loaderData.related);
    setClientChecked(Boolean(loaderData.post));
  }, [loaderData, slug]);

  useEffect(() => {
    if (loaderData.post) return;

    let active = true;
    void Promise.all([fetchPublishedPost(slug), fetchPublishedPosts()]).then(
      ([postData, postsData]) => {
        if (!active) return;
        setPost(postData.post);
        setCategories(postData.categories);
        setRelated(selectRelatedPosts(postsData.posts, slug));
        setClientChecked(true);
      },
    );

    return () => {
      active = false;
    };
  }, [loaderData, slug]);

  if (!post) {
    return clientChecked ? <BlogPostNotFound /> : <BlogPostLoading />;
  }

  const categoryName = getCategoryName(categories, post.category);
  const tone = getPostTone(post.category);
  const headings = getBlogHeadings(post.content);

  return (
    <>
      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="post-page">
        <div className="container-x" style={{ marginBottom: "1.5rem" }}>
          <nav className="post-breadcrumb" aria-label="Migas de pan">
            <Link to="/">Inicio</Link>
            <span aria-hidden="true">/</span>
            <Link to="/blog">Blog</Link>
            <span aria-hidden="true">/</span>
            <span>{post.title}</span>
          </nav>
        </div>

        <div className="post-cover">
          <img
            src={post.featured_image || FALLBACK_BLOG_IMAGE}
            alt={`Ilustración del artículo: ${post.title}`}
            width={1600}
            height={900}
          />
          <span className="story-year">{getPostYear(post.published_at)}</span>
        </div>

        <header className="post-head">
          <span className="eyebrow">
            <span className="dot" /> {categoryName}
          </span>
          <h1>{post.title}</h1>
          <p className="post-meta">
            {formatPostDate(post.published_at)} · {readingTime(post.content)} de lectura
          </p>
        </header>

        {headings.length > 0 && (
          <nav className="post-toc" aria-labelledby="post-toc-title">
            <h2 id="post-toc-title">Tabla de contenidos</h2>
            <ol>
              {headings.map((heading) => (
                <li className={heading.level === 3 ? "is-nested" : undefined} key={heading.id}>
                  <a href={`#${heading.id}`}>{heading.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <article className="post-content">
          <BlogContent content={post.content} />
        </article>

        <section className={`post-waitlist tone-${tone}`} aria-label="Lista de espera">
          <div>
            <span>Acceso anticipado</span>
            <h2>Ordena las cuentas compartidas con Karma</h2>
            <p>
              Únete a la lista de espera y recibe la primera versión para gestionar gastos,
              objetivos y presupuesto del hogar en un solo lugar.
            </p>
          </div>
          <Link className="btn-pill btn-pill-dark" to="/lista-espera">
            Apuntarme
          </Link>
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
                  className={`story-card tone-${getPostTone(p.category, index)}`}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="story-cover">
                    <img
                      src={p.featured_image || FALLBACK_BLOG_IMAGE}
                      alt={`Ilustración del artículo: ${p.title}`}
                      loading="lazy"
                      width={1024}
                      height={1024}
                    />
                    <span className="story-year">{getPostYear(p.published_at)}</span>
                  </div>
                  <div className="story-body">
                    <h3>{p.title}</h3>
                    <p>{p.excerpt}</p>
                    <div className="story-meta">
                      <span>
                        {getCategoryName(categories, p.category)} · {readingTime(p.content)}
                      </span>
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

function BlogPostLoading() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="post-page">
        <div className="container-x section" aria-live="polite">
          <p>Cargando artículo…</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function BlogPostNotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="container-x section">
        <h1>Artículo no encontrado</h1>
        <p style={{ marginTop: "1rem", color: "var(--muted)" }}>
          Puede que el enlace esté roto o el post haya cambiado de sitio.
        </p>
        <Link to="/blog" className="btn btn-soft" style={{ marginTop: "1.5rem" }}>
          Volver al blog
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
