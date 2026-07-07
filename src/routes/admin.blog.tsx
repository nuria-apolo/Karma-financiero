import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Calendar,
  Check,
  Eye,
  FileText,
  Folder,
  LayoutList,
  LogOut,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import { BlogContent } from "@/components/blog/BlogContent";
import { supabase } from "@/integrations/supabase/client";
import type { BlogCategoryRow, BlogPostRow, BlogStatus } from "@/lib/blog-cms";
import {
  FALLBACK_BLOG_IMAGE,
  formatPostDate,
  getCategoryName,
  readingTime,
  slugify,
} from "@/lib/blog-cms";

type Collection = "blog" | "categories" | "legal";
type AuthState = "loading" | "signed-out" | "unauthorized" | "ready";
type StatusFilter = "all" | BlogStatus;

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlogPage,
});

function nowForInput() {
  return new Date().toISOString().slice(0, 16);
}

function toDateInput(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

function fromDateInput(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function createEmptyCategory(): BlogCategoryRow {
  return {
    id: "",
    name: "",
    slug: "",
    description: "",
    created_at: new Date().toISOString(),
  };
}

function AdminBlogPage() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"password" | "magic">("password");
  const [message, setMessage] = useState("");

  const [collection, setCollection] = useState<Collection>("blog");
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [categories, setCategories] = useState<BlogCategoryRow[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [postDraft, setPostDraft] = useState<BlogPostRow | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [categoryDraft, setCategoryDraft] = useState<BlogCategoryRow>(createEmptyCategory());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      await resolveAuth(data.session);
    }

    boot();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      resolveAuth(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function resolveAuth(nextSession: Session | null) {
    setMessage("");
    if (!nextSession) {
      setAuthState("signed-out");
      return;
    }

    const { data, error } = await supabase
      .from("blog_admins")
      .select("id")
      .eq("user_id", nextSession.user.id)
      .maybeSingle();

    if (error) {
      setAuthState("unauthorized");
      setMessage(error.message);
      return;
    }

    if (!data) {
      setAuthState("unauthorized");
      return;
    }

    setAuthState("ready");
    await loadCms();
  }

  async function loadCms() {
    const [{ data: postRows, error: postsError }, { data: categoryRows, error: categoriesError }] =
      await Promise.all([
        supabase.from("blog_posts").select("*").order("updated_at", { ascending: false }),
        supabase.from("blog_categories").select("*").order("name", { ascending: true }),
      ]);

    if (postsError || categoriesError) {
      setMessage(postsError?.message || categoriesError?.message || "No se pudo cargar el CMS.");
      return;
    }

    const nextPosts = postRows ?? [];
    const nextCategories = categoryRows ?? [];
    setPosts(nextPosts);
    setCategories(nextCategories);

    const nextSelected = selectedPostId
      ? nextPosts.find((post) => post.id === selectedPostId)
      : nextPosts[0];

    if (nextSelected) {
      setSelectedPostId(nextSelected.id);
      setPostDraft(nextSelected);
    }

    const nextCategory = selectedCategoryId
      ? nextCategories.find((category) => category.id === selectedCategoryId)
      : nextCategories[0];

    if (nextCategory) {
      setSelectedCategoryId(nextCategory.id);
      setCategoryDraft(nextCategory);
    }
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    if (loginMode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({
        email: loginEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/blog`,
        },
      });
      setMessage(error ? error.message : "Te hemos enviado un enlace de acceso.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) setMessage(error.message);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setAuthState("signed-out");
    setPosts([]);
    setPostDraft(null);
  }

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesStatus = statusFilter === "all" || post.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.excerpt.toLowerCase().includes(normalizedQuery) ||
        post.slug.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [posts, query, statusFilter]);

  function selectPost(post: BlogPostRow) {
    setSelectedPostId(post.id);
    setPostDraft(post);
    setCollection("blog");
  }

  function updatePost<K extends keyof BlogPostRow>(key: K, value: BlogPostRow[K]) {
    setPostDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function appendContent(snippet: string) {
    setPostDraft((current) => {
      if (!current) return current;
      const separator = current.content.trim() ? "\n\n" : "";
      return { ...current, content: `${current.content}${separator}${snippet}` };
    });
  }

  async function createPost() {
    setSaving(true);
    setMessage("");
    const title = "Nuevo articulo";
    const slug = `${slugify(title)}-${Date.now().toString().slice(-5)}`;
    const category = categories[0]?.slug ?? "metodo";

    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        title,
        slug,
        excerpt: "Resumen breve del articulo.",
        content: "Escribe aqui el contenido del articulo.",
        category,
        author: "Karma Financiero",
        status: "draft",
      })
      .select("*")
      .single();

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setPosts((current) => [data, ...current]);
    selectPost(data);
    setMessage("Articulo creado como borrador.");
  }

  async function savePost(nextStatus?: BlogStatus) {
    if (!postDraft) return;
    setSaving(true);
    setMessage("");

    const status = nextStatus ?? (postDraft.status as BlogStatus);
    const publishedAt =
      status === "published"
        ? postDraft.published_at || new Date().toISOString()
        : null;

    const { data, error } = await supabase
      .from("blog_posts")
      .update({
        title: postDraft.title,
        slug: slugify(postDraft.slug || postDraft.title),
        excerpt: postDraft.excerpt,
        content: postDraft.content,
        featured_image: postDraft.featured_image || null,
        category: postDraft.category,
        author: postDraft.author || "Karma Financiero",
        status,
        published_at: publishedAt,
        seo_title: postDraft.seo_title || null,
        seo_description: postDraft.seo_description || null,
      })
      .eq("id", postDraft.id)
      .select("*")
      .single();

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setPosts((current) => current.map((post) => (post.id === data.id ? data : post)));
    setPostDraft(data);
    setMessage(status === "published" ? "Articulo publicado." : "Borrador guardado.");
  }

  async function deletePost() {
    if (!postDraft) return;
    const shouldDelete = window.confirm(`Eliminar "${postDraft.title}"?`);
    if (!shouldDelete) return;

    setSaving(true);
    const { error } = await supabase.from("blog_posts").delete().eq("id", postDraft.id);
    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const nextPosts = posts.filter((post) => post.id !== postDraft.id);
    setPosts(nextPosts);
    setPostDraft(nextPosts[0] ?? null);
    setSelectedPostId(nextPosts[0]?.id ?? "");
    setMessage("Articulo eliminado.");
  }

  function selectCategory(category: BlogCategoryRow) {
    setSelectedCategoryId(category.id);
    setCategoryDraft(category);
  }

  function updateCategory<K extends keyof BlogCategoryRow>(key: K, value: BlogCategoryRow[K]) {
    setCategoryDraft((current) => ({ ...current, [key]: value }));
  }

  async function createCategory() {
    const name = "Nueva categoria";
    const slug = `${slugify(name)}-${Date.now().toString().slice(-4)}`;
    const { data, error } = await supabase
      .from("blog_categories")
      .insert({ name, slug, description: "" })
      .select("*")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setCategories((current) => [...current, data].sort((a, b) => a.name.localeCompare(b.name)));
    selectCategory(data);
    setMessage("Categoria creada.");
  }

  async function saveCategory() {
    const { data, error } = await supabase
      .from("blog_categories")
      .update({
        name: categoryDraft.name,
        slug: slugify(categoryDraft.slug || categoryDraft.name),
        description: categoryDraft.description || null,
      })
      .eq("id", categoryDraft.id)
      .select("*")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setCategories((current) =>
      current.map((category) => (category.id === data.id ? data : category)).sort((a, b) => a.name.localeCompare(b.name)),
    );
    setCategoryDraft(data);
    setMessage("Categoria guardada.");
  }

  async function deleteCategory() {
    if (!categoryDraft.id) return;
    const shouldDelete = window.confirm(`Eliminar la categoria "${categoryDraft.name}"?`);
    if (!shouldDelete) return;

    const { error } = await supabase.from("blog_categories").delete().eq("id", categoryDraft.id);
    if (error) {
      setMessage(error.message);
      return;
    }

    const nextCategories = categories.filter((category) => category.id !== categoryDraft.id);
    setCategories(nextCategories);
    setCategoryDraft(nextCategories[0] ?? createEmptyCategory());
    setSelectedCategoryId(nextCategories[0]?.id ?? "");
    setMessage("Categoria eliminada.");
  }

  if (authState === "loading") {
    return (
      <main className="admin-auth">
        <div className="admin-auth-card">
          <Sparkles size={20} />
          <p>Cargando panel editorial...</p>
        </div>
      </main>
    );
  }

  if (authState === "signed-out") {
    return (
      <main className="admin-auth">
        <form className="admin-auth-card" onSubmit={handleLogin}>
          <img src="/logo-karma.svg" alt="Karma Financiero" />
          <div>
            <span>CMS privado</span>
            <h1>Entrar al panel</h1>
          </div>
          <label>
            Email
            <input value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} type="email" required />
          </label>
          {loginMode === "password" && (
            <label>
              Contrasena
              <input
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                type="password"
                required
              />
            </label>
          )}
          <button className="admin-primary" type="submit">
            {loginMode === "password" ? "Entrar" : "Enviar enlace"}
          </button>
          <button
            className="admin-link-button"
            type="button"
            onClick={() => setLoginMode(loginMode === "password" ? "magic" : "password")}
          >
            {loginMode === "password" ? "Prefiero enlace magico" : "Usar contrasena"}
          </button>
          {message && <p className="admin-message">{message}</p>}
        </form>
      </main>
    );
  }

  if (authState === "unauthorized") {
    return (
      <main className="admin-auth">
        <section className="admin-auth-card">
          <img src="/logo-karma.svg" alt="Karma Financiero" />
          <div>
            <span>Acceso pendiente</span>
            <h1>Tu usuario aun no esta autorizado</h1>
          </div>
          <p>
            Has iniciado sesion correctamente, pero este usuario no figura en `blog_admins`.
          </p>
          {session?.user.id && (
            <code className="admin-code">
              insert into public.blog_admins (user_id, email) values ('{session.user.id}', '{session.user.email}');
            </code>
          )}
          {message && <p className="admin-message">{message}</p>}
          <button className="admin-secondary" type="button" onClick={handleSignOut}>
            Salir
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <img src="/logo-karma.svg" alt="Karma Financiero" />
        </Link>
        <nav>
          <button className={collection === "blog" ? "active" : ""} onClick={() => setCollection("blog")}>
            <FileText size={16} /> Blog
          </button>
          <button className={collection === "categories" ? "active" : ""} onClick={() => setCollection("categories")}>
            <Folder size={16} /> Categorias
          </button>
          <button className={collection === "legal" ? "active" : ""} onClick={() => setCollection("legal")}>
            <LayoutList size={16} /> Legal Pages
          </button>
        </nav>
        <div className="admin-user">
          <span>{session?.user.email}</span>
          <button type="button" onClick={handleSignOut} aria-label="Cerrar sesion">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {collection === "blog" && (
        <>
          <section className="admin-list">
            <header className="admin-list-head">
              <div>
                <span>Collection</span>
                <h1>Blog</h1>
              </div>
              <button className="admin-icon-button" type="button" onClick={createPost} aria-label="Nuevo articulo">
                <Plus size={18} />
              </button>
            </header>

            <div className="admin-tools">
              <label className="admin-search">
                <Search size={15} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar articulos" />
              </label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
                <option value="all">Todos</option>
                <option value="draft">Draft</option>
                <option value="published">Live</option>
              </select>
            </div>

            <div className="admin-post-list">
              {filteredPosts.map((post) => (
                <button
                  key={post.id}
                  className={post.id === selectedPostId ? "admin-row active" : "admin-row"}
                  type="button"
                  onClick={() => selectPost(post)}
                >
                  <span className={`admin-status ${post.status === "published" ? "live" : "draft"}`}>
                    {post.status === "published" ? "Live" : "Draft"}
                  </span>
                  <strong>{post.title}</strong>
                  <small>{getCategoryName(categories, post.category)} · {formatPostDate(post.published_at)}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="admin-editor">
            {postDraft ? (
              <>
                <header className="admin-editor-head">
                  <div>
                    <span>Article</span>
                    <h2>{postDraft.title}</h2>
                  </div>
                  <div className="admin-actions">
                    <button className="admin-secondary" type="button" onClick={() => savePost("draft")} disabled={saving}>
                      <Save size={15} /> Draft
                    </button>
                    <button className="admin-primary" type="button" onClick={() => savePost("published")} disabled={saving}>
                      <Check size={15} /> Live
                    </button>
                  </div>
                </header>

                <div className="admin-form-grid">
                  <label>
                    Titulo
                    <input value={postDraft.title} onChange={(event) => updatePost("title", event.target.value)} />
                  </label>
                  <label>
                    Slug
                    <input value={postDraft.slug} onChange={(event) => updatePost("slug", slugify(event.target.value))} />
                  </label>
                  <label className="span-2">
                    Extracto
                    <textarea value={postDraft.excerpt} onChange={(event) => updatePost("excerpt", event.target.value)} />
                  </label>
                  <label>
                    Categoria
                    <select value={postDraft.category} onChange={(event) => updatePost("category", event.target.value)}>
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>{category.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Autor
                    <input value={postDraft.author} onChange={(event) => updatePost("author", event.target.value)} />
                  </label>
                  <label>
                    Estado
                    <select value={postDraft.status} onChange={(event) => updatePost("status", event.target.value)}>
                      <option value="draft">Draft</option>
                      <option value="published">Live</option>
                    </select>
                  </label>
                  <label>
                    Fecha
                    <span className="admin-date-field">
                      <Calendar size={15} />
                      <input
                        type="datetime-local"
                        value={toDateInput(postDraft.published_at) || nowForInput()}
                        onChange={(event) => updatePost("published_at", fromDateInput(event.target.value))}
                      />
                    </span>
                  </label>
                  <label className="span-2">
                    Imagen destacada
                    <input
                      value={postDraft.featured_image ?? ""}
                      onChange={(event) => updatePost("featured_image", event.target.value)}
                      placeholder="/blog/imagen.jpg o https://..."
                    />
                  </label>
                </div>

                <section className="admin-content-editor">
                  <div className="admin-editor-toolbar">
                    <button type="button" onClick={() => appendContent("## Nuevo apartado")}>H2</button>
                    <button type="button" onClick={() => appendContent("### Subapartado")}>H3</button>
                    <button type="button" onClick={() => appendContent("- Punto importante")}>Lista</button>
                    <button type="button" onClick={() => appendContent("**Texto destacado**")}>Bold</button>
                  </div>
                  <textarea
                    value={postDraft.content}
                    onChange={(event) => updatePost("content", event.target.value)}
                    aria-label="Contenido del articulo"
                  />
                </section>

                <div className="admin-form-grid">
                  <label>
                    SEO title
                    <input
                      value={postDraft.seo_title ?? ""}
                      onChange={(event) => updatePost("seo_title", event.target.value)}
                    />
                  </label>
                  <label>
                    SEO description
                    <textarea
                      value={postDraft.seo_description ?? ""}
                      onChange={(event) => updatePost("seo_description", event.target.value)}
                    />
                  </label>
                </div>

                <section className="admin-preview">
                  <div className="admin-preview-head">
                    <span><Eye size={14} /> Vista previa</span>
                    <small>{readingTime(postDraft.content)}</small>
                  </div>
                  <img src={postDraft.featured_image || FALLBACK_BLOG_IMAGE} alt="" />
                  <h1>{postDraft.title}</h1>
                  <p>{postDraft.excerpt}</p>
                  <div className="post-content admin-preview-content">
                    <BlogContent content={postDraft.content} />
                  </div>
                </section>

                <footer className="admin-danger-zone">
                  <button className="admin-danger" type="button" onClick={deletePost}>
                    <Trash2 size={15} /> Eliminar articulo
                  </button>
                </footer>
              </>
            ) : (
              <div className="admin-empty-state">
                <h2>No hay articulos todavia</h2>
                <button className="admin-primary" type="button" onClick={createPost}>
                  <Plus size={15} /> Nuevo articulo
                </button>
              </div>
            )}
          </section>
        </>
      )}

      {collection === "categories" && (
        <>
          <section className="admin-list">
            <header className="admin-list-head">
              <div>
                <span>Collection</span>
                <h1>Categorias</h1>
              </div>
              <button className="admin-icon-button" type="button" onClick={createCategory} aria-label="Nueva categoria">
                <Plus size={18} />
              </button>
            </header>
            <div className="admin-post-list">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={category.id === selectedCategoryId ? "admin-row active" : "admin-row"}
                  type="button"
                  onClick={() => selectCategory(category)}
                >
                  <strong>{category.name}</strong>
                  <small>/{category.slug}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="admin-editor">
            <header className="admin-editor-head">
              <div>
                <span>Category</span>
                <h2>{categoryDraft.name || "Nueva categoria"}</h2>
              </div>
              <button className="admin-primary" type="button" onClick={saveCategory}>
                <Save size={15} /> Guardar
              </button>
            </header>
            <div className="admin-form-grid">
              <label>
                Nombre
                <input value={categoryDraft.name} onChange={(event) => updateCategory("name", event.target.value)} />
              </label>
              <label>
                Slug
                <input value={categoryDraft.slug} onChange={(event) => updateCategory("slug", slugify(event.target.value))} />
              </label>
              <label className="span-2">
                Descripcion
                <textarea
                  value={categoryDraft.description ?? ""}
                  onChange={(event) => updateCategory("description", event.target.value)}
                />
              </label>
            </div>
            <footer className="admin-danger-zone">
              <button className="admin-danger" type="button" onClick={deleteCategory}>
                <Trash2 size={15} /> Eliminar categoria
              </button>
            </footer>
          </section>
        </>
      )}

      {collection === "legal" && (
        <>
          <section className="admin-list">
            <header className="admin-list-head">
              <div>
                <span>Collection</span>
                <h1>Legal Pages</h1>
              </div>
            </header>
            <div className="admin-post-list">
              {["Aviso legal", "Privacidad", "Cookies"].map((page) => (
                <div className="admin-row" key={page}>
                  <strong>{page}</strong>
                  <small>Pagina estatica actual</small>
                </div>
              ))}
            </div>
          </section>
          <section className="admin-editor">
            <div className="admin-empty-state">
              <h2>Legal Pages queda preparado en la sidebar</h2>
              <p>El CMS de blog y categorias ya es editable. Las paginas legales siguen siendo estaticas por ahora.</p>
            </div>
          </section>
        </>
      )}

      {message && <div className="admin-toast">{message}</div>}
    </main>
  );
}
