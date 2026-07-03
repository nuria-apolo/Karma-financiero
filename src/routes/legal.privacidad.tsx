import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/legal/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de privacidad — Karma Financiero" },
      { name: "description", content: "Cómo trata Karma Financiero los datos personales de quienes visitan su sitio web." },
      { property: "og:title", content: "Política de privacidad — Karma Financiero" },
      { property: "og:description", content: "Tratamiento de datos personales en Karma Financiero." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://karmafinanciero.com/legal/privacidad" },
    ],
    links: [{ rel: "canonical", href: "https://karmafinanciero.com/legal/privacidad" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <div className="container-x legal-content">
          <span className="eyebrow"><span className="dot" /> Legal</span>
          <h1>Política de privacidad</h1>
          <p className="legal-meta">Última actualización: 30 de junio de 2026</p>

          <h2>1. Responsable del tratamiento</h2>
          <p>
            El responsable del tratamiento de tus datos es <strong>Karma Financiero</strong>.
            Contacto: <a href="mailto:hola@karmafinanciero.com">hola@karmafinanciero.com</a>.
          </p>

          <h2>2. Datos que tratamos</h2>
          <p>
            Tratamos los datos que nos facilitas voluntariamente al darte de alta en la app, al
            suscribirte a la newsletter o al contactarnos: nombre, correo electrónico y la
            información necesaria para prestar el servicio.
          </p>

          <h2>3. Finalidades</h2>
          <ul>
            <li>Prestar y mantener el servicio de Karma Financiero.</li>
            <li>Enviar comunicaciones sobre el producto y novedades cuando lo autorices.</li>
            <li>Atender consultas, soporte y obligaciones legales.</li>
          </ul>

          <h2>4. Legitimación</h2>
          <p>
            La base legal del tratamiento es la ejecución del contrato (uso del servicio), el
            consentimiento (newsletter y cookies no esenciales) y el interés legítimo para la
            mejora y seguridad de la plataforma.
          </p>

          <h2>5. Conservación</h2>
          <p>
            Conservamos tus datos mientras mantengas la relación con nosotros y, posteriormente,
            durante los plazos legalmente exigibles.
          </p>

          <h2>6. Derechos</h2>
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición,
            limitación y portabilidad escribiendo a{" "}
            <a href="mailto:hola@karmafinanciero.com">hola@karmafinanciero.com</a>. También puedes
            reclamar ante la Agencia Española de Protección de Datos.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
