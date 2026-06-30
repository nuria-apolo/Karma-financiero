import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/legal/cookies")({
  head: () => ({
    meta: [
      { title: "Política de cookies — Karma Financiero" },
      { name: "description", content: "Qué cookies usa Karma Financiero y cómo configurarlas." },
      { property: "og:title", content: "Política de cookies — Karma Financiero" },
      { property: "og:description", content: "Información sobre el uso de cookies en Karma Financiero." },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  const reset = () => {
    try {
      window.localStorage.removeItem("karma-cookies-consent-v1");
      window.location.reload();
    } catch {
      /* no-op */
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <div className="container-x legal-content">
          <span className="eyebrow"><span className="dot" /> Legal</span>
          <h1>Política de cookies</h1>
          <p className="legal-meta">Última actualización: 30 de junio de 2026</p>

          <h2>¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos que un sitio web almacena en tu dispositivo para
            recordar información sobre tu visita, como tus preferencias o el inicio de sesión.
          </p>

          <h2>Cookies que utilizamos</h2>
          <ul>
            <li>
              <strong>Técnicas (necesarias):</strong> imprescindibles para que el sitio funcione,
              recordar tus preferencias de consentimiento, etc.
            </li>
            <li>
              <strong>Analíticas:</strong> nos ayudan a entender cómo se usa el sitio y a
              mejorarlo. Solo se activan si las aceptas.
            </li>
          </ul>

          <h2>Gestión del consentimiento</h2>
          <p>
            La primera vez que visitas el sitio mostramos un banner para que aceptes o rechaces
            las cookies no esenciales. Puedes cambiar tu decisión en cualquier momento desde el
            botón siguiente:
          </p>
          <p>
            <button type="button" className="btn-pill btn-pill-dark" onClick={reset}>
              Reabrir preferencias de cookies
            </button>
          </p>

          <h2>Cómo desactivarlas en el navegador</h2>
          <p>
            También puedes bloquear o eliminar las cookies desde la configuración de tu navegador
            (Chrome, Firefox, Safari, Edge, etc.). Ten en cuenta que algunas partes del sitio
            pueden dejar de funcionar correctamente.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
