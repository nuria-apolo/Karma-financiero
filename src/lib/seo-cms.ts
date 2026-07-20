import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export const SITE_URL = "https://karmafinanciero.com";

export type SeoPageRow = Tables<"seo_pages">;
export type SeoPageInsert = TablesInsert<"seo_pages">;
export type SeoPageUpdate = TablesUpdate<"seo_pages">;
export type SeoRedirectRow = Tables<"seo_redirects">;
export type SeoRedirectInsert = TablesInsert<"seo_redirects">;
export type SeoRedirectUpdate = TablesUpdate<"seo_redirects">;
export type SeoSourceType = "static" | "blog" | "legal" | "custom";

export interface SeoHeadDefaults {
  path: string;
  title: string;
  description: string;
  image?: string | null;
  type?: "website" | "article";
}

export interface SeoJsonLdScript {
  type: "application/ld+json";
  children: string;
}

export function normalizeSeoPath(path: string) {
  if (!path) return "/";
  const clean = path.trim();
  if (!clean.startsWith("/")) return `/${clean}`;
  return clean.length > 1 ? clean.replace(/\/+$/, "") : "/";
}

export function absoluteUrl(value: string | null | undefined, fallbackPath = "/") {
  const nextValue = value || fallbackPath;
  try {
    return new URL(nextValue, SITE_URL).href;
  } catch {
    return new URL(fallbackPath, SITE_URL).href;
  }
}

export function slugFromPath(path: string) {
  const normalized = normalizeSeoPath(path);
  if (normalized === "/") return "/";
  return normalized.split("/").filter(Boolean).at(-1) ?? normalized;
}

export function robotsContent(
  seo: Pick<SeoPageRow, "indexable" | "follow_links"> | null | undefined,
) {
  const index = seo?.indexable === false ? "noindex" : "index";
  const follow = seo?.follow_links === false ? "nofollow" : "follow";
  return `${index}, ${follow}`;
}

export function parseSchemaJson(value: Json | null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value;
}

export function schemaJsonFromText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = JSON.parse(trimmed) as Json;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("El schema debe ser un objeto JSON.");
  }
  return parsed;
}

export async function fetchSeoPage(path: string) {
  try {
    const { data, error } = await supabase
      .from("seo_pages")
      .select("*")
      .eq("path", normalizeSeoPath(path))
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`[seo] Could not load SEO page for ${path}`, error);
    return null as SeoPageRow | null;
  }
}

export function buildSeoHead(options: {
  seo?: SeoPageRow | null;
  defaults: SeoHeadDefaults;
  scripts?: SeoJsonLdScript[];
}) {
  const { seo, defaults, scripts = [] } = options;
  const path = normalizeSeoPath(defaults.path);
  const title = seo?.title || defaults.title;
  const description = seo?.description || defaults.description;
  const canonical = absoluteUrl(seo?.canonical_url || path);
  const ogTitle = seo?.og_title || title;
  const ogDescription = seo?.og_description || description;
  const image = absoluteUrl(seo?.og_image || defaults.image || "/head-icon.png", path);
  const type = defaults.type ?? "website";
  const customSchema = parseSchemaJson(seo?.schema_json ?? null);

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: robotsContent(seo) },
      { property: "og:site_name", content: "Karma Financiero" },
      { property: "og:locale", content: "es_ES" },
      { property: "og:title", content: ogTitle },
      { property: "og:description", content: ogDescription },
      { property: "og:type", content: type },
      { property: "og:url", content: canonical },
      { property: "og:image", content: image },
      { property: "og:image:secure_url", content: image },
      { property: "og:image:alt", content: ogTitle },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: ogTitle },
      { name: "twitter:description", content: ogDescription },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: ogTitle },
      { name: "twitter:url", content: canonical },
    ],
    links: [{ rel: "canonical", href: canonical }],
    scripts: [
      ...scripts,
      ...(customSchema
        ? [
            {
              type: "application/ld+json" as const,
              children: JSON.stringify(customSchema),
            },
          ]
        : []),
    ],
  };
}
