import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import karmaIcon from "@/assets/karma-icon.png.asset.json";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CookieBanner } from "@/components/CookieBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

function NotFoundComponent() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="not-found-page">
        <section className="not-found-card" aria-labelledby="not-found-title">
          <span className="eyebrow">
            <span className="dot" /> Error 404
          </span>
          <h1 id="not-found-title">Esta página se ha ido de presupuesto.</h1>
          <p>
            La URL no existe o ha cambiado de lugar. Puedes volver al inicio, leer el blog o unirte
            a la lista de espera de Karma Financiero.
          </p>
          <div className="not-found-actions" aria-label="Opciones principales">
            <Link to="/" className="btn-pill btn-pill-dark">
              Volver al inicio
            </Link>
            <Link to="/blog" className="btn-pill btn-pill-ghost">
              Leer el blog
            </Link>
            <Link to="/lista-espera" className="btn-pill btn-pill-ghost">
              Lista de espera
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-background px-4"
    >
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { property: "og:site_name", content: "Karma Financiero" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "google-site-verification", content: "8C6kEq8rh_zhbOv-p8zNrO9arQpp8wvoG-s6cbpftiY" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: karmaIcon.url },
    ],
    scripts: [
      {
        children: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
(function(){
  var saved = null;
  try { saved = window.localStorage.getItem('karma-cookies-consent-v1'); } catch (e) {}
  var granted = saved === 'accepted';
  gtag('consent', 'default', {
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
    analytics_storage: granted ? 'granted' : 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });
  gtag('set', 'ads_data_redaction', !granted);
  gtag('set', 'url_passthrough', !granted);
  window.loadKarmaAnalytics = function(){
    if (window.__karmaAnalyticsLoaded) return;
    window.__karmaAnalyticsLoaded = true;
    var head = document.getElementsByTagName('head')[0];
    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-B04NPYW44V';
    head.appendChild(ga);
    gtag('js', new Date());
    gtag('config', 'G-B04NPYW44V');
  };
  window.loadKarmaMetricool = function(){
    if (window.__karmaMetricoolLoaded) return;
    window.__karmaMetricoolLoaded = true;
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://tracker.metricool.com/resources/be.js';
    script.onload = script.onreadystatechange = function(){
      if (window.beTracker && typeof window.beTracker.t === 'function') {
        window.beTracker.t({ hash: '2c69c6b44bc43befeff10b472a9bf8d1' });
      }
    };
    head.appendChild(script);
  };
  if (granted) {
    window.setTimeout(function(){
      window.loadKarmaAnalytics();
      window.loadKarmaMetricool();
    }, 1200);
  }
})();`,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Saltar al contenido principal
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <CookieBanner />
    </QueryClientProvider>
  );
}
