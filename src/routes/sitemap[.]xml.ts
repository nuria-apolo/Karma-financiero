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
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let blogPaths: SitemapEntry[] = [];
        let seoPaths: string[] = [];
        let noindexPaths = new Set<string>();
        try {
          const { posts } = await fetchPublishedPosts();
          blogPaths = posts.map((p) => ({
            path: `/blog/${p.slug}`,
            changefreq: "monthly" as const,
            priority: "0.6",
          }));
        } catch (error) {
          console.error("[sitemap] Could not load published blog posts", error);
        }

        try {
          const { data, error } = await supabase
            .from("seo_pages")
            .select("path,indexable,status")
            .eq("status", "published");

          if (error) throw error;
          seoPaths = (data ?? [])
            .filter((page) => page.indexable)
            .map((page) => normalizeSeoPath(page.path));
          noindexPaths = new Set(
            (data ?? [])
              .filter((page) => !page.indexable)
              .map((page) => normalizeSeoPath(page.path)),
          );
        } catch (error) {
          console.error("[sitemap] Could not load SEO index settings", error);
        }

        const baseEntries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/lista-espera", changefreq: "weekly", priority: "0.9" },
          { path: "/blog", changefreq: "weekly", priority: "0.8" },
          ...blogPaths,
          { path: "/legal/aviso-legal", changefreq: "yearly", priority: "0.3" },
          { path: "/legal/privacidad", changefreq: "yearly", priority: "0.3" },
          { path: "/legal/cookies", changefreq: "yearly", priority: "0.3" },
          { path: "/legal/accesibilidad", changefreq: "yearly", priority: "0.3" },
          ...seoPaths.map((path): SitemapEntry => ({
            path,
            changefreq: "weekly",
            priority: "0.5",
          })),
        ];

        const entries = baseEntries
          .filter(
            (entry, index, all) => all.findIndex((item) => item.path === entry.path) === index,
          )
          .filter((entry) => !noindexPaths.has(normalizeSeoPath(entry.path)));

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
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
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
