
-- Categories
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_categories TO anon, authenticated;
GRANT ALL ON public.blog_categories TO service_role;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Posts
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  featured_image TEXT,
  category TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Karma Financiero',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Admins
CREATE TABLE public.blog_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_admins TO authenticated;
GRANT ALL ON public.blog_admins TO service_role;
ALTER TABLE public.blog_admins ENABLE ROW LEVEL SECURITY;

-- Access requests
CREATE TABLE public.blog_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE ON public.blog_access_requests TO authenticated;
GRANT ALL ON public.blog_access_requests TO service_role;
ALTER TABLE public.blog_access_requests ENABLE ROW LEVEL SECURITY;

-- Legal pages
CREATE TABLE public.legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  eyebrow TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.legal_pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.legal_pages TO authenticated;
GRANT ALL ON public.legal_pages TO service_role;
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

-- Helper: is_blog_admin
CREATE OR REPLACE FUNCTION public.is_blog_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.blog_admins WHERE user_id = _user_id)
$$;

-- Policies: blog_categories
CREATE POLICY "Categories are viewable by everyone"
  ON public.blog_categories FOR SELECT
  USING (true);
CREATE POLICY "Admins manage categories"
  ON public.blog_categories FOR ALL
  TO authenticated
  USING (public.is_blog_admin(auth.uid()))
  WITH CHECK (public.is_blog_admin(auth.uid()));

-- Policies: blog_posts
CREATE POLICY "Published posts are viewable by everyone"
  ON public.blog_posts FOR SELECT
  USING (status = 'published');
CREATE POLICY "Admins view all posts"
  ON public.blog_posts FOR SELECT
  TO authenticated
  USING (public.is_blog_admin(auth.uid()));
CREATE POLICY "Admins manage posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (public.is_blog_admin(auth.uid()))
  WITH CHECK (public.is_blog_admin(auth.uid()));

-- Policies: blog_admins
CREATE POLICY "Admins can view admins"
  ON public.blog_admins FOR SELECT
  TO authenticated
  USING (public.is_blog_admin(auth.uid()) OR user_id = auth.uid());
CREATE POLICY "Admins manage admins"
  ON public.blog_admins FOR ALL
  TO authenticated
  USING (public.is_blog_admin(auth.uid()))
  WITH CHECK (public.is_blog_admin(auth.uid()));

-- Policies: blog_access_requests
CREATE POLICY "Users view own request"
  ON public.blog_access_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_blog_admin(auth.uid()));
CREATE POLICY "Users create own request"
  ON public.blog_access_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own request; admins update any"
  ON public.blog_access_requests FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR public.is_blog_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_blog_admin(auth.uid()));

-- Policies: legal_pages
CREATE POLICY "Legal pages are viewable by everyone"
  ON public.legal_pages FOR SELECT
  USING (true);
CREATE POLICY "Admins manage legal pages"
  ON public.legal_pages FOR ALL
  TO authenticated
  USING (public.is_blog_admin(auth.uid()))
  WITH CHECK (public.is_blog_admin(auth.uid()));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER blog_posts_set_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TRIGGER legal_pages_set_updated_at
  BEFORE UPDATE ON public.legal_pages
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Seed categories
INSERT INTO public.blog_categories (name, slug, description) VALUES
  ('Convivencia', 'convivencia', 'Rituales y conversaciones sobre dinero en pareja.'),
  ('Método', 'metodo', 'Cómo organizar el presupuesto del hogar.'),
  ('Objetivos', 'objetivos', 'Metas compartidas y ahorro.')
ON CONFLICT (slug) DO NOTHING;

-- Seed legal pages
INSERT INTO public.legal_pages (title, slug, eyebrow, intro, content, seo_title, seo_description) VALUES
  ('Aviso legal', 'aviso-legal', 'Información legal',
   'Información sobre la titularidad, las condiciones de uso y las responsabilidades aplicables al sitio web de Karma Financiero.',
   E'## 1. Titular del sitio\n\nEste sitio web está gestionado por **Karma Financiero**. Para cualquier comunicación puedes escribirnos a hola@karmafinanciero.com.',
   'Aviso legal — Karma Financiero', 'Información legal del sitio web de Karma Financiero.'),
  ('Política de privacidad', 'privacidad', 'Privacidad y datos',
   'Te explicamos de forma clara qué datos tratamos, para qué los utilizamos y cómo puedes ejercer tus derechos.',
   E'## 1. Responsable\n\nEl responsable del tratamiento es **Karma Financiero**.',
   'Política de privacidad — Karma Financiero', 'Cómo trata Karma Financiero los datos personales.'),
  ('Política de cookies', 'cookies', 'Preferencias y cookies',
   'Conoce qué cookies utiliza Karma Financiero, para qué sirven y cómo puedes cambiar tus preferencias.',
   E'## 1. ¿Qué son las cookies?\n\nSon pequeños archivos que un sitio web almacena en tu dispositivo.',
   'Política de cookies — Karma Financiero', 'Qué cookies usa Karma Financiero y cómo configurarlas.'),
  ('Declaración de accesibilidad', 'accesibilidad', 'Compromiso accesible',
   'En Karma Financiero queremos que ordenar la economía del hogar sea fácil para todas las personas.',
   E'## 1. Situación de cumplimiento\n\nEste sitio es **parcialmente conforme** con WCAG 2.1 AA.',
   'Declaración de accesibilidad — Karma Financiero', 'Compromiso de accesibilidad de Karma Financiero.')
ON CONFLICT (slug) DO NOTHING;
