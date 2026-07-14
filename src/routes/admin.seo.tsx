import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  BadgeCheck,
  ExternalLink,
  FileText,
  ImagePlus,
  LayoutList,
  Link2,
  LoaderCircle,
  LogOut,
  Save,
  Search,
  SearchCheck,
  Sparkles,
  Trash2,
} from "lucide-react";

import { getBlogHeadings } from "@/components/blog/BlogContent";
import { supabase } from "@/integrations/supabase/client";
import type { BlogPostRow } from "@/lib/blog-cms";
import type { LegalPageRow } from "@/lib/legal-cms";
import {
  absoluteUrl,
  normalizeSeoPath,
  schemaJsonFromText,
  slugFromPath,
  type SeoPageInsert,
  type SeoPageRow,
  type SeoRedirectRow,
  type SeoSourceType,
  SITE_URL,
} from "@/lib/seo-cms";

type AuthState = "loading" | "signed-out" | "unauthorized" | "ready";
type SeoCollection = "pages" | "redirects";
type SeoTab = "metadata" | "social" | "headings" | "schema";
type StatusFilter = "all" | "published" | "draft" | "noindex";

const SEO_IMAGE_BUCKET = "blog-images";
const MAX_SEO_IMAGE_SIZE = 5 * 1024 * 1024;
const SEO_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const SEO_IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

interface SeoSource {
  path: string;
  title: string;
  description: string;
  image: string | null;
  sourceType: SeoSourceType;
  sourceId: string | null;
  content?: string;
  headings?: SeoHeading[];
}

interface SeoHeading {
  id: string;
  level: 1 | 2 | 3;
  text: string;
}

interface SeoDraft {
  id: string | null;
  path: string;
  title: string;
  description: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
  indexable: boolean;
  follow_links: boolean;
  schema_type: string;
  schema_json: string;
  status: "draft" | "published";
  source_type: SeoSourceType;
  source_id: string | null;
}

interface RedirectDraft {
  from_path: string;
  to_path: string;
  status_code: 301 | 302 | 307 | 308;
  active: boolean;
}

const STATIC_SEO_SOURCES: SeoSource[] = [
  {
    path: "/",
    title: "Karma Financiero — Finanzas compartidas con calma",
    description:
      "Organiza el dinero compartido con calma. Gestiona ingresos, gastos, objetivos y deudas en pareja o familia.",
    image: "/head-icon.png",
    sourceType: "static",
    sourceId: null,
    headings: [
      { id: "hero", level: 1, text: "Gestiona las finanzas compartidas de tu hogar" },
      { id: "features", level: 2, text: "Hecho para hogares, impulsado por la calma" },
      { id: "planes", level: 2, text: "Empieza simple, crece tranquilo" },
      { id: "home-faq-title", level: 2, text: "Finanzas compartidas, sin hacerlo enorme" },
      { id: "cta", level: 2, text: "Empieza hoy. Respira mejor mañana." },
    ],
  },
  {
    path: "/lista-espera",
    title: "Únete a Karma Financiero — Lista de espera",
    description:
      "Déjanos tu correo y te avisaremos cuando Karma Financiero esté listo para tu hogar.",
    image: "/head-icon.png",
    sourceType: "static",
    sourceId: null,
    headings: [{ id: "lista-espera", level: 1, text: "Únete a la lista de espera" }],
  },
  {
    path: "/blog",
    title: "Diario de Karma — Blog de finanzas compartidas",
    description:
      "Lecturas cortas sobre hablar de dinero en pareja, presupuesto del hogar y objetivos compartidos.",
    image: "/head-icon.png",
    sourceType: "static",
    sourceId: null,
    headings: [
      { id: "blog", level: 1, text: "Blog de finanzas compartidas para hogares reales." },
      { id: "featured", level: 2, text: "Artículo destacado" },
      { id: "latest", level: 2, text: "Últimas lecturas" },
    ],
  },
];

export const Route = createFileRoute("/admin/seo")({
  component: AdminSeoPage,
});

function toFriendlyAuthMessage(input: string) {
  if (/invalid login credentials/i.test(input)) return "Email o contrasena incorrectos.";
  if (/email not confirmed/i.test(input))
    return "Primero confirma tu email desde el correo de acceso.";
  return input || "No se pudo validar el acceso.";
}

function makeDraft(source: SeoSource, existing?: SeoPageRow): SeoDraft {
  return {
    id: existing?.id ?? null,
    path: existing?.path ?? normalizeSeoPath(source.path),
    title: existing?.title ?? source.title,
    description: existing?.description ?? source.description,
    canonical_url: existing?.canonical_url ?? absoluteUrl(source.path),
    og_title: existing?.og_title ?? existing?.title ?? source.title,
    og_description: existing?.og_description ?? existing?.description ?? source.description,
    og_image: existing?.og_image ?? source.image ?? "/head-icon.png",
    indexable: existing?.indexable ?? true,
    follow_links: existing?.follow_links ?? true,
    schema_type: existing?.schema_type ?? (source.sourceType === "blog" ? "Article" : "WebPage"),
    schema_json: existing?.schema_json ? JSON.stringify(existing.schema_json, null, 2) : "",
    status: (existing?.status as "draft" | "published" | undefined) ?? "published",
    source_type: (existing?.source_type as SeoSourceType | undefined) ?? source.sourceType,
    source_id: existing?.source_id ?? source.sourceId,
  };
}

function buildSources(posts: BlogPostRow[], legalPages: LegalPageRow[]): SeoSource[] {
  const blogSources = posts.map((post) => ({
    path: `/blog/${post.slug}`,
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    image: post.featured_image,
    sourceType: "blog" as const,
    sourceId: post.id,
    content: post.content,
    headings: [
      { id: post.slug, level: 1 as const, text: post.title },
      ...getBlogHeadings(post.content),
      { id: "post-cta", level: 2 as const, text: "Ordena las cuentas compartidas con Karma" },
      { id: "related", level: 2 as const, text: "Sigue leyendo" },
    ],
  }));

  const legalSources = legalPages.map((page) => ({
    path: `/legal/${page.slug}`,
    title: page.seo_title || page.title,
    description: page.seo_description || page.intro,
    image: "/head-icon.png",
    sourceType: "legal" as const,
    sourceId: page.id,
    content: page.content,
    headings: [{ id: page.slug, level: 1 as const, text: page.title }],
  }));

  return [...STATIC_SEO_SOURCES, ...blogSources, ...legalSources];
}

function AdminSeoPage() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingOgImage, setUploadingOgImage] = useState(false);
  const [collection, setCollection] = useState<SeoCollection>("pages");
  const [tab, setTab] = useState<SeoTab>("metadata");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [legalPages, setLegalPages] = useState<LegalPageRow[]>([]);
  const [seoPages, setSeoPages] = useState<SeoPageRow[]>([]);
  const [redirects, setRedirects] = useState<SeoRedirectRow[]>([]);
  const [selectedPath, setSelectedPath] = useState("/");
  const [draft, setDraft] = useState<SeoDraft | null>(null);
  const [redirectDraft, setRedirectDraft] = useState<RedirectDraft>({
    from_path: "",
    to_path: "",
    status_code: 301,
    active: true,
  });

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

  const sources = useMemo(() => buildSources(posts, legalPages), [posts, legalPages]);

  const pages = useMemo(() => {
    const seen = new Set<string>();
    const merged = sources.map((source) => {
      seen.add(source.path);
      const existing = seoPages.find((page) => page.path === source.path);
      return { source, existing, draft: makeDraft(source, existing) };
    });

    seoPages
      .filter((page) => !seen.has(page.path))
      .forEach((page) => {
        const source: SeoSource = {
          path: page.path,
          title: page.title,
          description: page.description,
          image: page.og_image,
          sourceType: (page.source_type as SeoSourceType) || "custom",
          sourceId: page.source_id,
        };
        merged.push({ source, existing: page, draft: makeDraft(source, page) });
      });

    return merged.sort((a, b) => a.source.path.localeCompare(b.source.path));
  }, [sources, seoPages]);

  const filteredPages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return pages.filter((page) => {
      const item = page.draft;
      const matchesQuery =
        !normalizedQuery ||
        item.path.toLowerCase().includes(normalizedQuery) ||
        item.title.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter ||
        (statusFilter === "noindex" && !item.indexable);
      return matchesQuery && matchesStatus;
    });
  }, [pages, query, statusFilter]);

  const selectedSource = pages.find((page) => page.draft.path === selectedPath)?.source ?? sources[0];
  const headings = selectedSource?.headings ?? [];

  useEffect(() => {
    if (!pages.length) return;
    const selected = pages.find((page) => page.draft.path === selectedPath) ?? pages[0];
    setSelectedPath(selected.draft.path);
    setDraft(selected.draft);
  }, [pages, selectedPath]);

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
      setMessage(toFriendlyAuthMessage(error.message));
      return;
    }

    if (!data) {
      setAuthState("unauthorized");
      return;
    }

    setAuthState("ready");
    await loadSeoData();
  }

  async function loadSeoData() {
    setLoadingData(true);
    const [
      { data: postRows, error: postError },
      { data: legalRows, error: legalError },
      { data: seoRows, error: seoError },
      { data: redirectRows, error: redirectError },
    ] = await Promise.all([
      supabase.from("blog_posts").select("*").order("updated_at", { ascending: false }),
      supabase.from("legal_pages").select("*").order("title", { ascending: true }),
      supabase.from("seo_pages").select("*").order("updated_at", { ascending: false }),
      supabase.from("seo_redirects").select("*").order("updated_at", { ascending: false }),
    ]);
    setLoadingData(false);

    if (postError || legalError || seoError || redirectError) {
      setMessage(
        postError?.message ||
          legalError?.message ||
          seoError?.message ||
          redirectError?.message ||
          "No se pudo cargar el panel SEO.",
      );
      return;
    }

    setPosts(postRows ?? []);
    setLegalPages(legalRows ?? []);
    setSeoPages(seoRows ?? []);
    setRedirects(redirectRows ?? []);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(toFriendlyAuthMessage(error.message));
      return;
    }
    setSession(data.session);
    await resolveAuth(data.session);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setAuthState("signed-out");
  }

  function selectPage(path: string) {
    const selected = pages.find((page) => page.draft.path === path);
    if (!selected) return;
    setSelectedPath(path);
    setDraft(selected.draft);
    setMessage("");
  }

  function updateDraft<Key extends keyof SeoDraft>(key: Key, value: SeoDraft[Key]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function uploadOgImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !draft) return;

    if (!SEO_IMAGE_TYPES.has(file.type)) {
      setMessage("Usa una imagen JPG, PNG, WebP o AVIF.");
      return;
    }

    if (file.size > MAX_SEO_IMAGE_SIZE) {
      setMessage("La imagen no puede superar los 5 MB.");
      return;
    }

    setUploadingOgImage(true);
    setMessage("");

    const extension = SEO_IMAGE_EXTENSIONS[file.type];
    const folder = slugFromPath(draft.path) || "home";
    const filePath = `seo/${folder}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(SEO_IMAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      setUploadingOgImage(false);
      setMessage(`No se pudo subir la imagen: ${uploadError.message}`);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from(SEO_IMAGE_BUCKET).getPublicUrl(filePath);
    updateDraft("og_image", publicUrlData.publicUrl);
    setUploadingOgImage(false);
    setMessage("Imagen OG subida. Guarda los cambios para publicarla en esta pagina.");
  }

  async function saveSeoPage() {
    if (!draft || !session) return;
    setSaving(true);
    setMessage("");

    let schemaJson = null;
    try {
      schemaJson = schemaJsonFromText(draft.schema_json);
    } catch (error) {
      setSaving(false);
      setMessage(error instanceof Error ? error.message : "El schema JSON no es valido.");
      return;
    }

    const payload: SeoPageInsert = {
      path: normalizeSeoPath(draft.path),
      title: draft.title.trim(),
      description: draft.description.trim(),
      canonical_url: draft.canonical_url.trim() || null,
      og_title: draft.og_title.trim() || null,
      og_description: draft.og_description.trim() || null,
      og_image: draft.og_image.trim() || null,
      indexable: draft.indexable,
      follow_links: draft.follow_links,
      schema_type: draft.schema_type,
      schema_json: schemaJson,
      status: draft.status,
      source_type: draft.source_type,
      source_id: draft.source_id,
      updated_by: session.user.id,
    };

    const { data, error } = await supabase
      .from("seo_pages")
      .upsert(payload, { onConflict: "path" })
      .select("*")
      .single();

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setSeoPages((current) => [
      data,
      ...current.filter((page) => page.id !== data.id && page.path !== data.path),
    ]);
    setSelectedPath(data.path);
    setDraft(makeDraft({ ...selectedSource, path: data.path }, data));
    setMessage("SEO guardado correctamente.");
  }

  async function saveRedirect() {
    setSaving(true);
    setMessage("");
    const { data, error } = await supabase
      .from("seo_redirects")
      .upsert(
        {
          from_path: normalizeSeoPath(redirectDraft.from_path),
          to_path: redirectDraft.to_path.trim(),
          status_code: redirectDraft.status_code,
          active: redirectDraft.active,
        },
        { onConflict: "from_path" },
      )
      .select("*")
      .single();

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setRedirects((current) => [data, ...current.filter((redirect) => redirect.id !== data.id)]);
    setRedirectDraft({ from_path: "", to_path: "", status_code: 301, active: true });
    setMessage("Redireccion guardada.");
  }

  async function deleteRedirect(id: string) {
    setSaving(true);
    const { error } = await supabase.from("seo_redirects").delete().eq("id", id);
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setRedirects((current) => current.filter((redirect) => redirect.id !== id));
  }

  if (authState === "loading") {
    return (
      <main id="main-content" tabIndex={-1} className="admin-auth">
        <div className="admin-auth-card">
          <Sparkles size={20} />
          <p>Cargando SEO Manager...</p>
        </div>
      </main>
    );
  }

  if (authState === "signed-out") {
    return (
      <main id="main-content" tabIndex={-1} className="admin-auth">
        <form className="admin-auth-card" onSubmit={handleLogin}>
          <img src="/logo-karma.svg" alt="Karma Financiero" />
          <div>
            <span>SEO Manager</span>
            <h1>Entrar al panel SEO</h1>
          </div>
          <label>
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
            />
          </label>
          <label>
            Contrasena
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="admin-primary" type="submit">
            Entrar
          </button>
          {message && <p className="admin-message">{message}</p>}
        </form>
      </main>
    );
  }

  if (authState === "unauthorized") {
    return (
      <main id="main-content" tabIndex={-1} className="admin-auth">
        <section className="admin-auth-card">
          <img src="/logo-karma.svg" alt="Karma Financiero" />
          <div>
            <span>Acceso pendiente</span>
            <h1>Tu usuario no esta autorizado para SEO</h1>
          </div>
          <p className="admin-message">
            El acceso SEO usa la misma lista de administradores del CMS. Solicita acceso desde el
            panel editorial.
          </p>
          <Link className="admin-primary" to="/admin/blog">
            Ir al CMS
          </Link>
          <button className="admin-secondary" type="button" onClick={handleSignOut}>
            Salir
          </button>
          {message && <p className="admin-message">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="admin-shell seo-admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <img src="/logo-karma.svg" alt="Karma Financiero" />
        </Link>
        <nav>
          <Link to="/admin/blog">
            <FileText size={16} /> Blog
          </Link>
          <Link to="/admin/blog">
            <LayoutList size={16} /> Legal Pages
          </Link>
          <Link to="/admin/blog">
            <BadgeCheck size={16} /> Accesos
          </Link>
          <button
            type="button"
            className={collection === "pages" ? "active" : ""}
            onClick={() => setCollection("pages")}
          >
            <SearchCheck size={16} /> SEO Manager
          </button>
          <button
            type="button"
            className={collection === "redirects" ? "active" : ""}
            onClick={() => setCollection("redirects")}
          >
            <Link2 size={16} /> Redirecciones
          </button>
        </nav>
        <div className="admin-user">
          <span>{session?.user.email}</span>
          <button type="button" onClick={handleSignOut} aria-label="Cerrar sesion">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      <section className="admin-list">
        <header className="admin-list-head">
          <div>
            <span>{collection === "pages" ? "SEO Manager" : "Redirecciones"}</span>
            <h1>{collection === "pages" ? "Paginas" : "301 / 302"}</h1>
          </div>
          {loadingData && <LoaderCircle className="admin-spin-icon" size={18} aria-hidden="true" />}
        </header>

        {collection === "pages" ? (
          <>
            <div className="admin-tools">
              <label className="admin-search">
                <Search size={15} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar URL o titulo"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                <option value="all">Todos</option>
                <option value="published">Indexables</option>
                <option value="draft">Draft</option>
                <option value="noindex">Noindex</option>
              </select>
            </div>

            <div className="admin-post-list">
              {filteredPages.map((page) => (
                <button
                  key={page.draft.path}
                  className={page.draft.path === selectedPath ? "admin-row active" : "admin-row"}
                  type="button"
                  onClick={() => selectPage(page.draft.path)}
                >
                  <span className={`admin-status ${page.draft.indexable ? "live" : "draft"}`}>
                    {page.draft.indexable ? "Index" : "Noindex"}
                  </span>
                  <strong>{page.draft.path}</strong>
                  <small>{page.draft.title}</small>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="admin-post-list">
            {redirects.map((redirect) => (
              <div key={redirect.id} className="admin-row">
                <span className={`admin-status ${redirect.active ? "live" : "draft"}`}>
                  {redirect.status_code}
                </span>
                <strong>{redirect.from_path}</strong>
                <small>{redirect.to_path}</small>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="admin-editor seo-editor">
        {collection === "redirects" ? (
          <>
            <header className="admin-editor-head">
              <div>
                <span>SEO Manager</span>
                <h2>Redirecciones generales</h2>
              </div>
            </header>
            <section className="seo-panel-card">
              <h3>Redirecciones 301 / 302</h3>
              <p>
                Crea redirecciones globales para URLs antiguas, cambios de slug o rutas que quieras
                consolidar sin editar una pagina concreta.
              </p>
              <div className="seo-redirect-form">
                <input
                  value={redirectDraft.from_path}
                  onChange={(event) =>
                    setRedirectDraft((current) => ({ ...current, from_path: event.target.value }))
                  }
                  placeholder="/url-antigua"
                />
                <input
                  value={redirectDraft.to_path}
                  onChange={(event) =>
                    setRedirectDraft((current) => ({ ...current, to_path: event.target.value }))
                  }
                  placeholder="/url-nueva"
                />
                <select
                  value={redirectDraft.status_code}
                  onChange={(event) =>
                    setRedirectDraft((current) => ({
                      ...current,
                      status_code: Number(event.target.value) as RedirectDraft["status_code"],
                    }))
                  }
                >
                  <option value={301}>301</option>
                  <option value={302}>302</option>
                  <option value={307}>307</option>
                  <option value={308}>308</option>
                </select>
                <button
                  className="admin-primary"
                  type="button"
                  onClick={saveRedirect}
                  disabled={saving}
                >
                  <Link2 size={15} /> Guardar
                </button>
              </div>
              <div className="seo-redirect-list">
                {redirects.map((redirect) => (
                  <div key={redirect.id}>
                    <span>{redirect.status_code}</span>
                    <strong>{redirect.from_path}</strong>
                    <small>→ {redirect.to_path}</small>
                    <button
                      type="button"
                      onClick={() => deleteRedirect(redirect.id)}
                      aria-label="Eliminar redireccion"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
            {message && <p className="admin-message admin-toast">{message}</p>}
          </>
        ) : draft ? (
          <>
            <header className="admin-editor-head">
              <div>
                <span>{draft.source_type}</span>
                <h2>{draft.title}</h2>
              </div>
              <div className="admin-actions">
                <a className="admin-secondary" href={draft.path} target="_blank" rel="noreferrer">
                  Vista previa <ExternalLink size={14} />
                </a>
                <button
                  className="admin-primary"
                  type="button"
                  onClick={saveSeoPage}
                  disabled={saving}
                >
                  <Save size={15} /> Guardar cambios
                </button>
              </div>
            </header>

            <div className="seo-tabs" role="tablist" aria-label="Secciones SEO">
              {[
                ["metadata", "Metadatos"],
                ["social", "Social / Open Graph"],
                ["headings", "Encabezados"],
                ["schema", "Schema"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={tab === id ? "active" : ""}
                  type="button"
                  onClick={() => setTab(id as SeoTab)}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "metadata" && (
              <div className="seo-editor-grid">
                <div className="admin-form-grid">
                  <label className="span-2">
                    URL
                    <input value={`${SITE_URL}${draft.path}`} readOnly />
                  </label>
                  <label>
                    Slug
                    <input value={slugFromPath(draft.path)} readOnly />
                  </label>
                  <label>
                    Canonical URL
                    <input
                      value={draft.canonical_url}
                      onChange={(event) => updateDraft("canonical_url", event.target.value)}
                    />
                  </label>
                  <label className="span-2">
                    Titulo SEO <small>{draft.title.length} / 60</small>
                    <input
                      value={draft.title}
                      onChange={(event) => updateDraft("title", event.target.value)}
                    />
                    <span className="seo-meter">
                      <i style={{ width: `${Math.min(100, (draft.title.length / 60) * 100)}%` }} />
                    </span>
                  </label>
                  <label className="span-2">
                    Meta description <small>{draft.description.length} / 160</small>
                    <textarea
                      value={draft.description}
                      onChange={(event) => updateDraft("description", event.target.value)}
                    />
                    <span className="seo-meter">
                      <i
                        style={{
                          width: `${Math.min(100, (draft.description.length / 160) * 100)}%`,
                        }}
                      />
                    </span>
                  </label>
                  <div className="seo-toggle-row span-2">
                    <span>Indexacion</span>
                    <button
                      className={draft.indexable ? "active" : ""}
                      type="button"
                      onClick={() => updateDraft("indexable", true)}
                    >
                      Index
                    </button>
                    <button
                      className={!draft.indexable ? "active" : ""}
                      type="button"
                      onClick={() => updateDraft("indexable", false)}
                    >
                      Noindex
                    </button>
                    <span>Seguimiento</span>
                    <button
                      className={draft.follow_links ? "active" : ""}
                      type="button"
                      onClick={() => updateDraft("follow_links", true)}
                    >
                      Follow
                    </button>
                    <button
                      className={!draft.follow_links ? "active" : ""}
                      type="button"
                      onClick={() => updateDraft("follow_links", false)}
                    >
                      Nofollow
                    </button>
                  </div>
                  <label>
                    Estado
                    <select
                      value={draft.status}
                      onChange={(event) =>
                        updateDraft("status", event.target.value as SeoDraft["status"])
                      }
                    >
                      <option value="published">Publicado</option>
                      <option value="draft">Draft</option>
                    </select>
                  </label>
                </div>

                <aside className="seo-preview-card">
                  <span>Vista previa en Google</span>
                  <small>Karma Financiero</small>
                  <small>{absoluteUrl(draft.path)}</small>
                  <h3>{draft.title}</h3>
                  <p>{draft.description}</p>
                </aside>
              </div>
            )}

            {tab === "social" && (
              <div className="seo-editor-grid">
                <div className="admin-form-grid">
                  <label className="span-2">
                    Titulo OG <small>{draft.og_title.length} / 95</small>
                    <input
                      value={draft.og_title}
                      onChange={(event) => updateDraft("og_title", event.target.value)}
                    />
                  </label>
                  <label className="span-2">
                    Descripcion OG <small>{draft.og_description.length} / 200</small>
                    <textarea
                      value={draft.og_description}
                      onChange={(event) => updateDraft("og_description", event.target.value)}
                    />
                  </label>
                  <div className="span-2 admin-image-field">
                    <span className="admin-field-label">Imagen OG</span>
                    <div className="admin-image-upload seo-image-upload">
                      <div className="admin-image-thumb">
                        <img src={draft.og_image || "/head-icon.png"} alt="" />
                      </div>
                      <div className="admin-image-controls">
                        <label
                          className={`admin-upload-button ${
                            uploadingOgImage ? "is-loading" : ""
                          }`}
                        >
                          {uploadingOgImage ? (
                            <LoaderCircle aria-hidden="true" size={17} />
                          ) : (
                            <ImagePlus aria-hidden="true" size={17} />
                          )}
                          {uploadingOgImage ? "Subiendo..." : "Subir desde el ordenador"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            onChange={uploadOgImage}
                            disabled={uploadingOgImage}
                          />
                        </label>
                        <small>JPG, PNG, WebP o AVIF · máximo 5 MB</small>
                        <input
                          aria-label="URL de la imagen Open Graph"
                          value={draft.og_image}
                          onChange={(event) => updateDraft("og_image", event.target.value)}
                          placeholder="/head-icon.png o https://..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <aside className="seo-og-card">
                  <img src={draft.og_image || "/head-icon.png"} alt="" />
                  <div>
                    <strong>{draft.og_title || draft.title}</strong>
                    <p>{draft.og_description || draft.description}</p>
                    <small>karmafinanciero.com</small>
                  </div>
                </aside>
              </div>
            )}

            {tab === "headings" && (
              <section className="seo-panel-card">
                <h3>Jerarquia detectada</h3>
                {headings.length > 0 ? (
                  <ol className="seo-heading-list">
                    {headings.map((heading) => (
                      <li
                        key={heading.id}
                        className={heading.level === 3 ? "is-nested" : undefined}
                      >
                        <span>H{heading.level}</span>
                        {heading.text}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>No hay encabezados detectados en esta pagina.</p>
                )}
              </section>
            )}

            {tab === "schema" && (
              <div className="admin-form-grid">
                <label>
                  Tipo de schema
                  <select
                    value={draft.schema_type}
                    onChange={(event) => updateDraft("schema_type", event.target.value)}
                  >
                    <option value="WebPage">WebPage</option>
                    <option value="Article">Article</option>
                    <option value="Blog">Blog</option>
                    <option value="FAQPage">FAQPage</option>
                    <option value="SoftwareApplication">SoftwareApplication</option>
                    <option value="Organization">Organization</option>
                  </select>
                </label>
                <label className="span-2">
                  Schema JSON avanzado
                  <textarea
                    value={draft.schema_json}
                    onChange={(event) => updateDraft("schema_json", event.target.value)}
                    placeholder='{"@context":"https://schema.org","@type":"FAQPage"}'
                  />
                </label>
              </div>
            )}

            {message && <p className="admin-message admin-toast">{message}</p>}
          </>
        ) : (
          <div className="admin-empty-state">
            <h2>No hay paginas SEO todavia</h2>
          </div>
        )}
      </section>
    </main>
  );
}
