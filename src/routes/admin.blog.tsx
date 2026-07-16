import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  AtSign,
  BadgeCheck,
  Bold,
  Calendar,
  Check,
  Code2,
  Eye,
  FileText,
  Folder,
  ImagePlus,
  Italic,
  LayoutList,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  LogOut,
  Plus,
  Quote,
  Save,
  Search,
  SearchCheck,
  Sparkles,
  Trash2,
  UserPlus,
} from "lucide-react";

import { BlogContent } from "@/components/blog/BlogContent";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { BlogCategoryRow, BlogPostRow, BlogStatus } from "@/lib/blog-cms";
import {
  FALLBACK_BLOG_IMAGE,
  formatPostDate,
  getCategoryName,
  readingTime,
  slugify,
} from "@/lib/blog-cms";
import type { LegalPageRow } from "@/lib/legal-cms";

type Collection = "blog" | "categories" | "access" | "legal";
type AuthState = "loading" | "signed-out" | "unauthorized" | "ready";
type StatusFilter = "all" | BlogStatus;
type AuthFormMode = "signin" | "request-access";
type AccessRequestRow = Tables<"blog_access_requests">;

const BLOG_IMAGE_BUCKET = "blog-images";
const MAX_BLOG_IMAGE_SIZE = 5 * 1024 * 1024;
const BLOG_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const BLOG_IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

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

function toFriendlyAuthMessage(input: string) {
  if (!input) return "";

  if (/invalid login credentials/i.test(input)) {
    return "Email o contrasena incorrectos.";
  }

  if (/email not confirmed/i.test(input)) {
    return "Primero confirma tu email desde el correo de acceso.";
  }

  if (/infinite recursion|policy|blog_admins/i.test(input)) {
    return "Todavia no hemos podido validar tu acceso. Prueba a recargar o volver a entrar en unos segundos.";
  }

  return input;
}

function AdminBlogPage() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [authFormMode, setAuthFormMode] = useState<AuthFormMode>("signin");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPasswordConfirm, setLoginPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");

  const [collection, setCollection] = useState<Collection>("blog");
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [categories, setCategories] = useState<BlogCategoryRow[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequestRow[]>([]);
  const [currentAccessRequest, setCurrentAccessRequest] = useState<AccessRequestRow | null>(null);
  const [selectedAccessRequestId, setSelectedAccessRequestId] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [postDraft, setPostDraft] = useState<BlogPostRow | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [categoryDraft, setCategoryDraft] = useState<BlogCategoryRow>(createEmptyCategory());
  const [legalPages, setLegalPages] = useState<LegalPageRow[]>([]);
  const [selectedLegalPageId, setSelectedLegalPageId] = useState("");
  const [legalDraft, setLegalDraft] = useState<LegalPageRow | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingContentImage, setUploadingContentImage] = useState(false);
  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

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
      setMessage(toFriendlyAuthMessage(error.message));
      return;
    }

    if (!data) {
      await loadOwnAccessRequest(nextSession.user.id);
      setAuthState("unauthorized");
      return;
    }

    setAuthState("ready");
    await loadCms();
  }

  async function loadCms() {
    const [
      { data: postRows, error: postsError },
      { data: categoryRows, error: categoriesError },
      { data: requestRows, error: requestsError },
      { data: legalRows, error: legalError },
    ] = await Promise.all([
      supabase.from("blog_posts").select("*").order("updated_at", { ascending: false }),
      supabase.from("blog_categories").select("*").order("name", { ascending: true }),
      supabase.from("blog_access_requests").select("*").order("requested_at", { ascending: false }),
      supabase.from("legal_pages").select("*").order("title", { ascending: true }),
    ]);

    if (postsError || categoriesError || requestsError || legalError) {
      setMessage(
        postsError?.message ||
          categoriesError?.message ||
          requestsError?.message ||
          legalError?.message ||
          "No se pudo cargar el CMS.",
      );
      return;
    }

    const nextPosts = postRows ?? [];
    const nextCategories = categoryRows ?? [];
    const nextRequests = requestRows ?? [];
    const nextLegalPages = legalRows ?? [];
    setPosts(nextPosts);
    setCategories(nextCategories);
    setAccessRequests(nextRequests);
    setLegalPages(nextLegalPages);

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

    const nextRequest = selectedAccessRequestId
      ? nextRequests.find((request) => request.id === selectedAccessRequestId)
      : nextRequests[0];

    if (nextRequest) {
      setSelectedAccessRequestId(nextRequest.id);
    }

    const nextLegalPage = selectedLegalPageId
      ? nextLegalPages.find((page) => page.id === selectedLegalPageId)
      : nextLegalPages[0];

    if (nextLegalPage) {
      setSelectedLegalPageId(nextLegalPage.id);
      setLegalDraft(nextLegalPage);
    }
  }

  async function loadOwnAccessRequest(userId: string) {
    const { data, error } = await supabase
      .from("blog_access_requests")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      setMessage(toFriendlyAuthMessage(error.message));
      return;
    }

    setCurrentAccessRequest(data);
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) setMessage(toFriendlyAuthMessage(error.message));
  }

  async function handleCreateAccount(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    if (loginPassword.length < 12) {
      setMessage("Usa una contrasena de al menos 12 caracteres.");
      return;
    }

    if (loginPassword !== loginPasswordConfirm) {
      setMessage("Las contrasenas no coinciden.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: loginEmail.trim(),
      password: loginPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/blog`,
      },
    });

    if (error) {
      setMessage(toFriendlyAuthMessage(error.message));
      return;
    }

    if (data.session) {
      await supabase.auth.signOut();
    }

    setAuthState("signed-out");
    setAuthFormMode("signin");
    setLoginPassword("");
    setLoginPasswordConfirm("");
    setMessage(
      "Solicitud iniciada. Revisa tu email para confirmar tu usuario y despues pide la aprobacion interna del CMS.",
    );
  }

  async function handleRequestAccess() {
    setMessage("");
    if (!session?.user?.id || !session.user.email) {
      setMessage("Necesitas iniciar sesion con tu cuenta verificada para solicitar acceso.");
      return;
    }

    const { data, error } = await supabase
      .from("blog_access_requests")
      .upsert(
        {
          user_id: session.user.id,
          email: session.user.email,
          status: "pending",
          reviewed_at: null,
        },
        { onConflict: "user_id" },
      )
      .select("*")
      .single();

    if (error) {
      setMessage(toFriendlyAuthMessage(error.message));
      return;
    }

    setCurrentAccessRequest(data);
    setMessage("Solicitud enviada. Cuando se apruebe, ya podras entrar al CMS.");
  }

  async function handlePasswordReset() {
    setMessage("");
    if (!loginEmail.trim()) {
      setMessage("Escribe primero tu email para enviarte el enlace de recuperacion de contrasena.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(), {
      redirectTo: `${window.location.origin}/admin/blog`,
    });

    setMessage(
      error
        ? toFriendlyAuthMessage(error.message)
        : "Te hemos enviado un correo para recuperar tu contrasena del CMS.",
    );
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setAuthState("signed-out");
    setPosts([]);
    setPostDraft(null);
    setLegalPages([]);
    setLegalDraft(null);
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

  function insertContentSnippet(snippet: string, selectOffset = snippet.length) {
    const textarea = contentTextareaRef.current;
    setPostDraft((current) => {
      if (!current) return current;

      if (!textarea) {
        const separator = current.content.trim() ? "\n\n" : "";
        return { ...current, content: `${current.content}${separator}${snippet}` };
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = current.content.slice(0, start);
      const after = current.content.slice(end);
      const prefix = before && !before.endsWith("\n\n") ? "\n\n" : "";
      const suffix = after && !after.startsWith("\n\n") ? "\n\n" : "";
      const nextContent = `${before}${prefix}${snippet}${suffix}${after}`;
      const nextCursor = start + prefix.length + selectOffset;

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(nextCursor, nextCursor);
      });

      return { ...current, content: nextContent };
    });
  }

  function insertContentBlock(prefix: string, fallback: string) {
    const textarea = contentTextareaRef.current;
    const selected = textarea
      ? postDraft?.content.slice(textarea.selectionStart, textarea.selectionEnd).trim()
      : "";
    insertContentSnippet(`${prefix}${selected || fallback}`);
  }

  function insertInlineMarkup(before: string, after: string, fallback: string) {
    const textarea = contentTextareaRef.current;
    if (!textarea || !postDraft) {
      insertContentSnippet(`${before}${fallback}${after}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = postDraft.content.slice(start, end) || fallback;
    const nextContent = `${postDraft.content.slice(0, start)}${before}${selected}${after}${postDraft.content.slice(end)}`;
    const selectionStart = start + before.length;
    const selectionEnd = selectionStart + selected.length;

    setPostDraft({ ...postDraft, content: nextContent });
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  }

  function insertLink() {
    const url = window.prompt("URL del enlace", "https://");
    if (!url) return;
    const safeUrl = url.trim();
    if (!/^https?:\/\//.test(safeUrl) && !safeUrl.startsWith("mailto:")) {
      setMessage("El enlace debe empezar por https://, http:// o mailto:");
      return;
    }
    insertInlineMarkup("[", `](${safeUrl})`, "Texto del enlace");
  }

  function insertMention() {
    const mention = window.prompt("Mencion", "@Karma Financiero");
    if (!mention) return;
    insertContentSnippet(mention.trim());
  }

  async function uploadBlogImageFile(file: File, folderPrefix: string) {
    if (!BLOG_IMAGE_TYPES.has(file.type)) {
      throw new Error("Usa una imagen JPG, PNG, WebP o AVIF.");
    }

    if (file.size > MAX_BLOG_IMAGE_SIZE) {
      throw new Error("La imagen no puede superar los 5 MB.");
    }

    const extension = BLOG_IMAGE_EXTENSIONS[file.type];
    const folder = slugify(folderPrefix) || "articulo";
    const filePath = `${folder}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(BLOG_IMAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(BLOG_IMAGE_BUCKET).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  }

  async function uploadFeaturedImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !postDraft) return;

    setUploadingImage(true);
    setMessage("");
    let publicUrl = "";
    try {
      publicUrl = await uploadBlogImageFile(file, postDraft.slug || postDraft.title);
    } catch (error) {
      setUploadingImage(false);
      setMessage(
        `No se pudo subir la imagen: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
      return;
    }

    const { data: updatedPost, error: updateError } = await supabase
      .from("blog_posts")
      .update({ featured_image: publicUrl })
      .eq("id", postDraft.id)
      .select("*")
      .single();

    setUploadingImage(false);
    if (updateError) {
      updatePost("featured_image", publicUrl);
      setMessage("La imagen se subió. Guarda el artículo para conservar el cambio.");
      return;
    }

    setPostDraft(updatedPost);
    setPosts((current) => current.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
    setMessage("Imagen subida y guardada.");
  }

  async function uploadContentImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !postDraft) return;

    setUploadingContentImage(true);
    setMessage("");

    try {
      const publicUrl = await uploadBlogImageFile(file, postDraft.slug || postDraft.title);
      const altText = window.prompt(
        "Texto alternativo de la imagen",
        file.name.replace(/\.[^.]+$/, ""),
      );
      insertContentSnippet(`![${altText?.trim() || "Imagen del articulo"}](${publicUrl})`);
      setMessage("Imagen insertada en el contenido. Guarda el articulo para conservar el cambio.");
    } catch (error) {
      setMessage(
        `No se pudo insertar la imagen: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    } finally {
      setUploadingContentImage(false);
    }
  }

  async function createPost() {
    setSaving(true);
    setMessage("");
    const title = "Nuevo articulo";
    const slug = `${slugify(title)}-${Date.now().toString().slice(-5)}`;
    const category = categories[0]?.slug ?? "consejos";

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
      status === "published" ? postDraft.published_at || new Date().toISOString() : null;

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

  async function saveCategory() {
    const { data, error } = await supabase
      .from("blog_categories")
      .update({
        name: categoryDraft.name,
        slug: categoryDraft.slug,
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
      current
        .map((category) => (category.id === data.id ? data : category))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setCategoryDraft(data);
    setMessage("Categoria guardada.");
  }

  function selectLegalPage(page: LegalPageRow) {
    setSelectedLegalPageId(page.id);
    setLegalDraft(page);
  }

  function updateLegalPage<K extends keyof LegalPageRow>(key: K, value: LegalPageRow[K]) {
    setLegalDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function saveLegalPage() {
    if (!legalDraft) return;
    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("legal_pages")
      .update({
        title: legalDraft.title,
        eyebrow: legalDraft.eyebrow,
        intro: legalDraft.intro,
        content: legalDraft.content,
        seo_title: legalDraft.seo_title || null,
        seo_description: legalDraft.seo_description || null,
      })
      .eq("id", legalDraft.id)
      .select("*")
      .single();

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setLegalPages((current) =>
      current
        .map((page) => (page.id === data.id ? data : page))
        .sort((a, b) => a.title.localeCompare(b.title)),
    );
    setLegalDraft(data);
    setMessage("Pagina legal guardada y publicada.");
  }

  async function reviewAccessRequest(request: AccessRequestRow, decision: "approved" | "rejected") {
    setSaving(true);
    setMessage("");

    if (decision === "approved") {
      const { error: adminError } = await supabase.from("blog_admins").upsert(
        {
          user_id: request.user_id,
          email: request.email,
        },
        { onConflict: "user_id" },
      );

      if (adminError) {
        setSaving(false);
        setMessage(adminError.message);
        return;
      }
    }

    const { data, error } = await supabase
      .from("blog_access_requests")
      .update({
        status: decision,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", request.id)
      .select("*")
      .single();

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setAccessRequests((current) => current.map((item) => (item.id === data.id ? data : item)));
    setSelectedAccessRequestId(data.id);
    setMessage(decision === "approved" ? "Usuario aprobado para el CMS." : "Solicitud rechazada.");
  }

  if (authState === "loading") {
    return (
      <main id="main-content" tabIndex={-1} className="admin-auth">
        <div className="admin-auth-card">
          <Sparkles size={20} />
          <p>Cargando panel editorial...</p>
        </div>
      </main>
    );
  }

  if (authState === "signed-out") {
    return (
      <main id="main-content" tabIndex={-1} className="admin-auth">
        <form
          className="admin-auth-card"
          onSubmit={authFormMode === "signin" ? handleLogin : handleCreateAccount}
        >
          <img src="/logo-karma.svg" alt="Karma Financiero" />
          <div>
            <span>CMS privado</span>
            <h1>{authFormMode === "signin" ? "Entrar al panel" : "Solicitar acceso"}</h1>
          </div>
          <p className="admin-message">
            {authFormMode === "signin"
              ? "Acceso solo con usuario autorizado y contrasena segura."
              : "Registra un usuario seguro, confirma tu email y solicita la aprobacion interna del CMS."}
          </p>
          <label>
            Email
            <input
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              type="email"
              required
            />
          </label>
          <label>
            Contrasena
            <input
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              type="password"
              autoComplete={authFormMode === "signin" ? "current-password" : "new-password"}
              required
            />
          </label>
          {authFormMode === "request-access" && (
            <label>
              Repite la contrasena
              <input
                value={loginPasswordConfirm}
                onChange={(event) => setLoginPasswordConfirm(event.target.value)}
                type="password"
                autoComplete="new-password"
                required
              />
            </label>
          )}
          <button className="admin-primary" type="submit">
            {authFormMode === "signin" ? "Entrar" : "Solicitar acceso"}
          </button>
          <button
            className="admin-link-button"
            type="button"
            onClick={() => {
              setMessage("");
              setAuthFormMode(authFormMode === "signin" ? "request-access" : "signin");
            }}
          >
            {authFormMode === "signin" ? "Solicitar acceso" : "Ya tengo acceso"}
          </button>
          <button className="admin-link-button" type="button" onClick={handlePasswordReset}>
            Recuperar contrasena
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
            <h1>Tu usuario aun no esta autorizado</h1>
          </div>
          <p>Tu cuenta existe, pero todavia esta pendiente de aprobacion para entrar al CMS.</p>
          <p className="admin-message">
            Cuando un administrador revise tu solicitud, podras entrar aqui con normalidad.
          </p>
          {currentAccessRequest ? (
            <div className="admin-request-state">
              <strong>Estado de la solicitud: {currentAccessRequest.status}</strong>
              <span>
                {currentAccessRequest.status === "pending"
                  ? "Tu solicitud ya esta enviada. Cuando te aprueben, recarga esta pantalla."
                  : currentAccessRequest.status === "approved"
                    ? "Tu acceso ya esta aprobado. Cierra sesion y vuelve a entrar si aun no te deja pasar."
                    : "Tu solicitud fue rechazada. Puedes hablar con la persona administradora del CMS."}
              </span>
            </div>
          ) : null}
          {!currentAccessRequest && (
            <button className="admin-primary" type="button" onClick={handleRequestAccess}>
              <UserPlus size={15} /> Solicitar acceso
            </button>
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
    <main id="main-content" tabIndex={-1} className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <img src="/logo-karma.svg" alt="Karma Financiero" />
        </Link>
        <nav>
          <button
            className={collection === "blog" ? "active" : ""}
            onClick={() => setCollection("blog")}
          >
            <FileText size={16} /> Blog
          </button>
          <button
            className={collection === "categories" ? "active" : ""}
            onClick={() => setCollection("categories")}
          >
            <Folder size={16} /> Categorias
          </button>
          <button
            className={collection === "access" ? "active" : ""}
            onClick={() => setCollection("access")}
          >
            <BadgeCheck size={16} /> Accesos
          </button>
          <button
            className={collection === "legal" ? "active" : ""}
            onClick={() => setCollection("legal")}
          >
            <LayoutList size={16} /> Legal Pages
          </button>
          <Link to="/admin/seo">
            <SearchCheck size={16} /> SEO Manager
          </Link>
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
              <button
                className="admin-icon-button"
                type="button"
                onClick={createPost}
                aria-label="Nuevo articulo"
              >
                <Plus size={18} />
              </button>
            </header>

            <div className="admin-tools">
              <label className="admin-search">
                <Search size={15} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar articulos"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
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
                  <span
                    className={`admin-status ${post.status === "published" ? "live" : "draft"}`}
                  >
                    {post.status === "published" ? "Live" : "Draft"}
                  </span>
                  <strong>{post.title}</strong>
                  <small>
                    {getCategoryName(categories, post.category)} ·{" "}
                    {formatPostDate(post.published_at)}
                  </small>
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
                    <button
                      className="admin-secondary"
                      type="button"
                      onClick={() => savePost("draft")}
                      disabled={saving}
                    >
                      <Save size={15} /> Draft
                    </button>
                    <button
                      className="admin-primary"
                      type="button"
                      onClick={() => savePost("published")}
                      disabled={saving}
                    >
                      <Check size={15} /> Live
                    </button>
                  </div>
                </header>

                <div className="admin-form-grid">
                  <label>
                    Titulo
                    <input
                      value={postDraft.title}
                      onChange={(event) => updatePost("title", event.target.value)}
                    />
                  </label>
                  <label>
                    Slug
                    <input
                      value={postDraft.slug}
                      onChange={(event) => updatePost("slug", slugify(event.target.value))}
                    />
                  </label>
                  <label className="span-2">
                    Extracto
                    <textarea
                      value={postDraft.excerpt}
                      onChange={(event) => updatePost("excerpt", event.target.value)}
                    />
                  </label>
                  <label>
                    Categoria
                    <select
                      value={postDraft.category}
                      onChange={(event) => updatePost("category", event.target.value)}
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Autor
                    <input
                      value={postDraft.author}
                      onChange={(event) => updatePost("author", event.target.value)}
                    />
                  </label>
                  <label>
                    Estado
                    <select
                      value={postDraft.status}
                      onChange={(event) => updatePost("status", event.target.value)}
                    >
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
                        onChange={(event) =>
                          updatePost("published_at", fromDateInput(event.target.value))
                        }
                      />
                    </span>
                  </label>
                  <div className="span-2 admin-image-field">
                    <span className="admin-field-label">Imagen destacada</span>
                    <div className="admin-image-upload">
                      <div className="admin-image-thumb">
                        <img src={postDraft.featured_image || FALLBACK_BLOG_IMAGE} alt="" />
                      </div>
                      <div className="admin-image-controls">
                        <label
                          className={`admin-upload-button ${uploadingImage ? "is-loading" : ""}`}
                        >
                          {uploadingImage ? (
                            <LoaderCircle aria-hidden="true" size={17} />
                          ) : (
                            <ImagePlus aria-hidden="true" size={17} />
                          )}
                          {uploadingImage ? "Subiendo..." : "Subir desde el ordenador"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            onChange={uploadFeaturedImage}
                            disabled={uploadingImage}
                          />
                        </label>
                        <small>JPG, PNG, WebP o AVIF · máximo 5 MB</small>
                        <input
                          aria-label="URL de la imagen destacada"
                          value={postDraft.featured_image ?? ""}
                          onChange={(event) => updatePost("featured_image", event.target.value)}
                          placeholder="/blog/imagen.jpg o https://..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <section className="admin-content-editor">
                  <div className="admin-editor-toolbar">
                    <label className="admin-inline-upload-button" aria-label="Insertar imagen">
                      {uploadingContentImage ? (
                        <LoaderCircle aria-hidden="true" size={18} />
                      ) : (
                        <Plus aria-hidden="true" size={18} />
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={uploadContentImage}
                        disabled={uploadingContentImage}
                      />
                    </label>
                    <select
                      aria-label="Formato de bloque"
                      defaultValue="paragraph"
                      onChange={(event) => {
                        if (event.target.value === "h2") {
                          insertContentBlock("## ", "Nuevo apartado");
                        }
                        if (event.target.value === "h3") {
                          insertContentBlock("### ", "Subapartado");
                        }
                        event.target.value = "paragraph";
                      }}
                    >
                      <option value="paragraph">Paragraph</option>
                      <option value="h2">H2</option>
                      <option value="h3">H3</option>
                    </select>
                    <button type="button" onClick={insertLink} aria-label="Insertar enlace">
                      <Link2 size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertInlineMarkup("**", "**", "Texto destacado")}
                      aria-label="Negrita"
                    >
                      <Bold size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertInlineMarkup("*", "*", "Texto en cursiva")}
                      aria-label="Cursiva"
                    >
                      <Italic size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentBlock("> ", "Cita destacada")}
                      aria-label="Cita"
                    >
                      <Quote size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentBlock("- ", "Punto importante")}
                      aria-label="Lista"
                    >
                      <List size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentSnippet("1. Primer punto\n2. Segundo punto")}
                      aria-label="Lista numerada"
                    >
                      <ListOrdered size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentSnippet("```\nCodigo o nota tecnica\n```")}
                      aria-label="Codigo"
                    >
                      <Code2 size={17} />
                    </button>
                    <button type="button" onClick={insertMention} aria-label="Mencionar">
                      <AtSign size={17} />
                    </button>
                  </div>
                  <textarea
                    ref={contentTextareaRef}
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
                    <span>
                      <Eye size={14} /> Vista previa
                    </span>
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
                <p>Base fija: Consejos, Recursos y Noticias.</p>
              </div>
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
                <input
                  value={categoryDraft.name}
                  onChange={(event) => updateCategory("name", event.target.value)}
                />
              </label>
              <label>
                Slug
                <input value={categoryDraft.slug} readOnly aria-describedby="category-slug-note" />
                <small id="category-slug-note">
                  Slug bloqueado para mantener la estructura SEO.
                </small>
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
              <p className="admin-message">
                Estas categorias son estructurales. Puedes editar nombre y descripcion, pero no
                eliminarlas.
              </p>
            </footer>
          </section>
        </>
      )}

      {collection === "access" && (
        <>
          <section className="admin-list">
            <header className="admin-list-head">
              <div>
                <span>Collection</span>
                <h1>Accesos</h1>
              </div>
            </header>
            <div className="admin-post-list">
              {accessRequests.map((request) => (
                <button
                  key={request.id}
                  className={
                    request.id === selectedAccessRequestId ? "admin-row active" : "admin-row"
                  }
                  type="button"
                  onClick={() => setSelectedAccessRequestId(request.id)}
                >
                  <span
                    className={`admin-status ${request.status === "approved" ? "live" : "draft"}`}
                  >
                    {request.status}
                  </span>
                  <strong>{request.email}</strong>
                  <small>{new Date(request.requested_at).toLocaleString("es-ES")}</small>
                </button>
              ))}
            </div>
          </section>
          <section className="admin-editor">
            {accessRequests.find((request) => request.id === selectedAccessRequestId) ? (
              (() => {
                const selectedRequest = accessRequests.find(
                  (request) => request.id === selectedAccessRequestId,
                )!;
                return (
                  <>
                    <header className="admin-editor-head">
                      <div>
                        <span>Solicitud</span>
                        <h2>{selectedRequest.email}</h2>
                      </div>
                    </header>
                    <div className="admin-access-card">
                      <p>
                        <strong>Email:</strong> {selectedRequest.email}
                      </p>
                      <p>
                        <strong>User ID:</strong> {selectedRequest.user_id}
                      </p>
                      <p>
                        <strong>Estado:</strong> {selectedRequest.status}
                      </p>
                      <p>
                        <strong>Solicitado:</strong>{" "}
                        {new Date(selectedRequest.requested_at).toLocaleString("es-ES")}
                      </p>
                      {selectedRequest.reviewed_at && (
                        <p>
                          <strong>Revisado:</strong>{" "}
                          {new Date(selectedRequest.reviewed_at).toLocaleString("es-ES")}
                        </p>
                      )}
                    </div>
                    <div className="admin-actions">
                      <button
                        className="admin-primary"
                        type="button"
                        disabled={saving || selectedRequest.status === "approved"}
                        onClick={() => reviewAccessRequest(selectedRequest, "approved")}
                      >
                        <Check size={15} /> Aprobar acceso
                      </button>
                      <button
                        className="admin-secondary"
                        type="button"
                        disabled={saving || selectedRequest.status === "rejected"}
                        onClick={() => reviewAccessRequest(selectedRequest, "rejected")}
                      >
                        <Trash2 size={15} /> Rechazar
                      </button>
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="admin-empty-state">
                <h2>No hay solicitudes seleccionadas</h2>
                <p>Cuando alguien cree cuenta y pida acceso, aparecerá aquí para aprobarlo.</p>
              </div>
            )}
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
              {legalPages.map((page) => (
                <button
                  className={page.id === selectedLegalPageId ? "admin-row active" : "admin-row"}
                  key={page.id}
                  type="button"
                  onClick={() => selectLegalPage(page)}
                >
                  <strong>{page.title}</strong>
                  <small>/legal/{page.slug}</small>
                </button>
              ))}
            </div>
          </section>
          <section className="admin-editor">
            {legalDraft ? (
              <>
                <header className="admin-editor-head">
                  <div>
                    <span>Legal page</span>
                    <h2>{legalDraft.title}</h2>
                  </div>
                  <div className="admin-actions">
                    <a
                      className="admin-secondary"
                      href={`/legal/${legalDraft.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Eye size={15} /> Ver pagina
                    </a>
                    <button
                      className="admin-primary"
                      type="button"
                      disabled={saving}
                      onClick={saveLegalPage}
                    >
                      <Save size={15} /> Guardar
                    </button>
                  </div>
                </header>

                <div className="admin-form-grid">
                  <label>
                    Titulo
                    <input
                      value={legalDraft.title}
                      onChange={(event) => updateLegalPage("title", event.target.value)}
                    />
                  </label>
                  <label>
                    Etiqueta superior
                    <input
                      value={legalDraft.eyebrow}
                      onChange={(event) => updateLegalPage("eyebrow", event.target.value)}
                    />
                  </label>
                  <label className="span-2">
                    Introduccion
                    <textarea
                      value={legalDraft.intro}
                      onChange={(event) => updateLegalPage("intro", event.target.value)}
                    />
                  </label>
                </div>

                <section className="admin-content-editor">
                  <div className="admin-editor-toolbar">
                    <span>Contenido</span>
                    <small>
                      Usa ## para cada apartado, - para listas y **texto** para negrita.
                    </small>
                  </div>
                  <textarea
                    value={legalDraft.content}
                    onChange={(event) => updateLegalPage("content", event.target.value)}
                  />
                </section>

                <div className="admin-form-grid">
                  <label>
                    SEO title
                    <input
                      value={legalDraft.seo_title ?? ""}
                      onChange={(event) => updateLegalPage("seo_title", event.target.value)}
                    />
                  </label>
                  <label>
                    SEO description
                    <textarea
                      value={legalDraft.seo_description ?? ""}
                      onChange={(event) => updateLegalPage("seo_description", event.target.value)}
                    />
                  </label>
                </div>

                <section className="admin-preview legal-admin-preview">
                  <div className="admin-preview-head">
                    <span>
                      <Eye size={14} /> Vista previa del contenido
                    </span>
                    <small>{legalDraft.eyebrow}</small>
                  </div>
                  <h1>{legalDraft.title}</h1>
                  <p>{legalDraft.intro}</p>
                  <div className="post-content admin-preview-content">
                    <BlogContent content={legalDraft.content} />
                  </div>
                </section>
              </>
            ) : (
              <div className="admin-empty-state">
                <h2>No hay paginas legales</h2>
                <p>Aplica la migracion de Supabase para cargar la coleccion.</p>
              </div>
            )}
          </section>
        </>
      )}

      {message && <div className="admin-toast">{message}</div>}
    </main>
  );
}
