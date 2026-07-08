import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { fetchPublishedPosts } from "@/lib/blog-cms";

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

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/lista-espera", changefreq: "weekly", priority: "0.9" },
          { path: "/blog", changefreq: "weekly", priority: "0.8" },
          ...blogPaths,
          { path: "/legal/aviso-legal", changefreq: "yearly", priority: "0.3" },
          { path: "/legal/privacidad", changefreq: "yearly", priority: "0.3" },
          { path: "/legal/cookies", changefreq: "yearly", priority: "0.3" },
          { path: "/legal/accesibilidad", changefreq: "yearly", priority: "0.3" },
        ];


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
