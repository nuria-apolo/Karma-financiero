import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/legal/aviso-legal")({
  head: () => ({
    meta: [
      { title: "Aviso legal — Karma Financiero" },
      { name: "description", content: "Información legal del sitio web de Karma Financiero." },
      { property: "og:title", content: "Aviso legal — Karma Financiero" },
      { property: "og:description", content: "Información legal del sitio web de Karma Financiero." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://karmafinanciero.com/legal/aviso-legal" },
    ],
    links: [{ rel: "canonical", href: "https://karmafinanciero.com/legal/aviso-legal" }],
  }),
  component: LegalNotice,
});

function LegalNotice() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="legal-page">
        <div className="container-x legal-content">
          <span className="eyebrow"><span className="dot" /> Legal</span>
          <h1>Aviso legal</h1>
          <p className="legal-meta">Última actualización: 30 de junio de 2026</p>

          <h2>1. Titular del sitio</h2>
          <p>
            Este sitio web (en adelante, "el Sitio") está gestionado por <strong>Karma Financiero</strong>.
            Para cualquier comunicación puedes escribirnos a{" "}
            <a href="mailto:hola@karmafinanciero.com">hola@karmafinanciero.com</a>.
          </p>

          <h2>2. Objeto</h2>
          <p>
            El presente aviso legal regula el uso del Sitio. La navegación por el mismo atribuye la
            condición de usuario e implica la aceptación plena de las disposiciones aquí incluidas.
          </p>

          <h2>3. Propiedad intelectual e industrial</h2>
          <p>
            Todos los contenidos del Sitio (textos, imágenes, marca, logotipo, diseño y código)
            son titularidad de Karma Financiero o de terceros que han autorizado su uso. Queda
            prohibida su reproducción total o parcial sin autorización expresa.
          </p>

          <h2>4. Responsabilidad</h2>
          <p>
            Karma Financiero no se hace responsable de los daños derivados del uso indebido del
            Sitio ni de la indisponibilidad temporal del servicio por causas técnicas o de fuerza
            mayor.
          </p>

          <h2>5. Legislación y jurisdicción</h2>
          <p>
            Las presentes condiciones se rigen por la legislación española. Para la resolución de
            controversias las partes se someten a los Juzgados y Tribunales del domicilio del
            usuario cuando este actúe como consumidor.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
