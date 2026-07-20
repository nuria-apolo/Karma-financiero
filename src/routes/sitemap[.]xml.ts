import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { fetchPublishedPosts } from "@/lib/blog-cms";
import { normalizeSeoPath } from "@/lib/seo-cms";

const BASE_URL = "https://karmafinanciero.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string | null;
}

function latestLastmod(...dates: Array<string | null | undefined>) {
  const validDates = dates
    .filter(Boolean)
    .map((date) => new Date(date as string))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (validDates.length === 0) return null;
  return new Date(Math.max(...validDates.map((date) => date.getTime()))).toISOString();
}

function mergeEntry(target: Map<string, SitemapEntry>, entry: SitemapEntry) {
  const path = normalizeSeoPath(entry.path);
  const existing = target.get(path);

  target.set(path, {
    path,
    changefreq: existing?.changefreq ?? entry.changefreq,
    priority: existing?.priority ?? entry.priority,
    lastmod: latestLastmod(existing?.lastmod, entry.lastmod),
  });
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let blogPaths: SitemapEntry[] = [];
        let seoPaths: SitemapEntry[] = [];
        let noindexPaths = new Set<string>();
        const seoLastmodByPath = new Map<string, string>();
        try {
          const { posts } = await fetchPublishedPosts();
          blogPaths = posts.map((p) => ({
            path: `/blog/${p.slug}`,
            changefreq: "monthly" as const,
            priority: "0.6",
            lastmod: latestLastmod(
              p.updated_at,
              p.published_at,
              seoLastmodByPath.get(normalizeSeoPath(`/blog/${p.slug}`)),
            ),
          }));
        } catch (error) {
          console.error("[sitemap] Could not load published blog posts", error);
        }

        try {
          const { data, error } = await supabase
            .from("seo_pages")
            .select("path,indexable,status,updated_at")
            .eq("status", "published");

          if (error) throw error;
          (data ?? []).forEach((page) => {
            seoLastmodByPath.set(normalizeSeoPath(page.path), page.updated_at);
          });
          seoPaths = (data ?? [])
            .filter((page) => page.indexable)
            .map((page) => ({
              path: normalizeSeoPath(page.path),
              changefreq: "weekly" as const,
              priority: "0.5",
              lastmod: page.updated_at,
            }));
          noindexPaths = new Set(
            (data ?? [])
              .filter((page) => !page.indexable)
              .map((page) => normalizeSeoPath(page.path)),
          );
        } catch (error) {
          console.error("[sitemap] Could not load SEO index settings", error);
        }

        const baseEntries: SitemapEntry[] = [
          {
            path: "/",
            changefreq: "weekly",
            priority: "1.0",
            lastmod: seoLastmodByPath.get("/"),
          },
          {
            path: "/lista-espera",
            changefreq: "weekly",
            priority: "0.9",
            lastmod: seoLastmodByPath.get("/lista-espera"),
          },
          {
            path: "/blog",
            changefreq: "weekly",
            priority: "0.8",
            lastmod: seoLastmodByPath.get("/blog"),
          },
          ...blogPaths,
          {
            path: "/legal/aviso-legal",
            changefreq: "yearly",
            priority: "0.3",
            lastmod: seoLastmodByPath.get("/legal/aviso-legal"),
          },
          {
            path: "/legal/privacidad",
            changefreq: "yearly",
            priority: "0.3",
            lastmod: seoLastmodByPath.get("/legal/privacidad"),
          },
          {
            path: "/legal/cookies",
            changefreq: "yearly",
            priority: "0.3",
            lastmod: seoLastmodByPath.get("/legal/cookies"),
          },
          {
            path: "/legal/accesibilidad",
            changefreq: "yearly",
            priority: "0.3",
            lastmod: seoLastmodByPath.get("/legal/accesibilidad"),
          },
          ...seoPaths,
        ];

        const entriesByPath = new Map<string, SitemapEntry>();
        baseEntries
          .filter((entry) => !noindexPaths.has(normalizeSeoPath(entry.path)))
          .forEach((entry) => mergeEntry(entriesByPath, entry));
        const entries = Array.from(entriesByPath.values());

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
          },
        });
      },
    },
  },
});
