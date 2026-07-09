import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

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
  if (category === "convivencia") return "green";
  if (category === "objetivos") return "blue";
  if (category === "metodo") return "yellow";
  return (["green", "yellow", "blue"] as BlogTone[])[index % 3];
}

export async function fetchPublishedPosts() {
  try {
    const [{ data: posts, error: postsError }, { data: categories, error: categoriesError }] =
      await Promise.all([
        supabase
          .from("blog_posts")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false }),
        supabase.from("blog_categories").select("*").order("name", { ascending: true }),
      ]);

    if (postsError) throw postsError;
    if (categoriesError) throw categoriesError;

    return {
      posts: posts ?? [],
      categories: categories ?? [],
    };
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

    return {
      post,
      categories: categories ?? [],
    };
  } catch (error) {
    console.error("[blog] Could not load published post from Supabase", error);
    return {
      post: null as BlogPostRow | null,
      categories: [] as BlogCategoryRow[],
    };
  }
}

