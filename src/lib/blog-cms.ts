import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

const SUPABASE_REST_URL = "https://vyjcfuhohzmzvuxmbqgv.supabase.co";
const SUPABASE_REST_KEY = "sb_publishable_4DLru48DNJm89EL3_lDGjA_Prs3Luw-";

export type BlogStatus = "draft" | "published";
export type BlogPostRow = Tables<"blog_posts">;
export type BlogPostInsert = TablesInsert<"blog_posts">;
export type BlogPostUpdate = TablesUpdate<"blog_posts">;
export type BlogCategoryRow = Tables<"blog_categories">;
export type BlogCategoryInsert = TablesInsert<"blog_categories">;
export type BlogCategoryUpdate = TablesUpdate<"blog_categories">;

export type BlogTone = "green" | "yellow" | "blue";

export const FALLBACK_BLOG_IMAGE = "/head-icon.png";

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 210))} min`;
}

export function formatPostDate(value: string | null) {
  if (!value) return "Sin publicar";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function getPostYear(value: string | null) {
  if (!value) return new Date().getFullYear().toString();
  return new Date(value).getFullYear().toString();
}

export function getCategoryName(categories: BlogCategoryRow[], slug: string) {
  return categories.find((category) => category.slug === slug)?.name ?? slug;
}

export function getPostTone(category: string, index = 0): BlogTone {
  if (["consejos", "convivencia", "pareja", "ahorro"].includes(category)) return "green";
  if (["recursos", "metodo", "objetivos"].includes(category)) return "blue";
  if (category === "noticias") return "yellow";
  return (["green", "yellow", "blue"] as BlogTone[])[index % 3];
}

async function withRetry<T>(operation: () => Promise<T>, label: string, attempts = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 180 * attempt));
      }
    }
  }

  console.error(`[blog] ${label} failed after ${attempts} attempts`, lastError);
  throw lastError;
}

async function fetchRest<T>(path: string): Promise<T> {
  const response = await fetch(`${SUPABASE_REST_URL}/rest/v1/${path}`, {
    headers: {
      Accept: "application/json",
      apikey: SUPABASE_REST_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(
      `REST fallback failed for ${path}: ${response.status} ${await response.text()}`,
    );
  }

  return (await response.json()) as T;
}

async function fetchPublishedPostsRest() {
  const [posts, categories] = await Promise.all([
    fetchRest<BlogPostRow[]>("blog_posts?select=*&status=eq.published&order=published_at.desc"),
    fetchRest<BlogCategoryRow[]>("blog_categories?select=*&order=name.asc"),
  ]);

  return {
    posts: posts ?? [],
    categories: categories ?? [],
  };
}

async function fetchPublishedPostRest(slug: string) {
  const [posts, categories] = await Promise.all([
    fetchRest<BlogPostRow[]>(
      `blog_posts?select=*&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`,
    ),
    fetchRest<BlogCategoryRow[]>("blog_categories?select=*&order=name.asc"),
  ]);

  return {
    post: posts?.[0] ?? null,
    categories: categories ?? [],
  };
}

export async function fetchPublishedPosts() {
  try {
    const [postsResult, categoriesResult] = await Promise.allSettled([
      withRetry(async () => {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false });

        if (error) throw error;
        return data ?? [];
      }, "Published posts query"),
      withRetry(async () => {
        const { data, error } = await supabase
          .from("blog_categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        return data ?? [];
      }, "Blog categories query"),
    ]);

    if (postsResult.status === "fulfilled" && postsResult.value.length > 0) {
      return {
        posts: postsResult.value,
        categories: categoriesResult.status === "fulfilled" ? categoriesResult.value : [],
      };
    }

    return await fetchPublishedPostsRest();
  } catch (error) {
    console.error("[blog] Could not load published posts from Supabase", error);
    return {
      posts: [] as BlogPostRow[],
      categories: [] as BlogCategoryRow[],
    };
  }
}

export async function fetchPublishedPost(slug: string) {
  try {
    const [{ data: post, error: postError }, { data: categories, error: categoriesError }] =
      await Promise.all([
        supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle(),
        supabase.from("blog_categories").select("*").order("name", { ascending: true }),
      ]);

    if (postError) throw postError;
    if (categoriesError) throw categoriesError;

    if (!post) {
      return await fetchPublishedPostRest(slug);
    }

    return {
      post,
      categories: categories ?? [],
    };
  } catch (error) {
    console.error("[blog] Could not load published post from Supabase client", error);

    try {
      return await fetchPublishedPostRest(slug);
    } catch (restError) {
      console.error("[blog] Could not load published post from REST fallback", restError);
      return {
        post: null as BlogPostRow | null,
        categories: [] as BlogCategoryRow[],
      };
    }
  }
}
