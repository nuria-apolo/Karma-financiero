import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/legal/accesibilidad")({
  head: () => ({
    meta: [
      { title: "Declaración de accesibilidad — Karma Financiero" },
      {
        name: "description",
        content:
          "Compromiso, situación de cumplimiento y canales de contacto sobre la accesibilidad de Karma Financiero.",
      },
      { property: "og:title", content: "Declaración de accesibilidad — Karma Financiero" },
      {
        property: "og:description",
        content: "Información sobre la accesibilidad del sitio web de Karma Financiero.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://karmafinanciero.com/legal/accesibilidad" },
    ],
    links: [{ rel: "canonical", href: "https://karmafinanciero.com/legal/accesibilidad" }],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="legal-page">
        <div className="container-x legal-content">
          <span className="eyebrow">
            <span className="dot" /> Accesibilidad
          </span>
          <h1>Declaración de accesibilidad</h1>
          <p className="legal-meta">Preparada el 8 de julio de 2026 · Última revisión: 8 de julio de 2026</p>

          <p>
            Karma Financiero se compromete a hacer accesible este sitio web para el mayor número
            posible de personas, con independencia de sus capacidades, tecnología o contexto de uso.
            Nuestro objetivo es cumplir el nivel AA de las Pautas de Accesibilidad para el Contenido
            Web (WCAG 2.1) y los requisitos aplicables de la norma UNE-EN 301549.
          </p>

          <h2>Situación de cumplimiento</h2>
          <p>
            Este sitio web es <strong>parcialmente conforme</strong> con WCAG 2.1 nivel AA. Hemos
            aplicado mejoras de estructura semántica, navegación con teclado, foco visible,
            alternativas textuales, formularios etiquetados y adaptación a distintos tamaños de
            pantalla. Aún estamos revisando todo el contenido y las integraciones de terceros para
            confirmar su conformidad completa.
          </p>

          <h2>Contenido que puede no ser plenamente accesible</h2>
          <ul>
            <li>
              Algunas imágenes o contenidos antiguos del blog pueden necesitar una descripción
              alternativa más detallada.
            </li>
            <li>
              Determinados servicios o contenidos suministrados por terceros pueden no ofrecer el
              mismo nivel de accesibilidad que el resto del sitio.
            </li>
            <li>
              Pueden existir combinaciones de navegador y tecnología de asistencia que todavía no
              hayan sido verificadas.
            </li>
          </ul>
          <p>
            No se invoca actualmente ninguna excepción por carga desproporcionada. Trabajamos para
            corregir las barreras detectadas de manera progresiva.
          </p>

          <h2>Medidas adoptadas</h2>
          <ul>
            <li>Estructura de encabezados y regiones semánticas para facilitar la navegación.</li>
            <li>Acceso mediante teclado y estilos de foco claramente visibles.</li>
            <li>Textos alternativos en imágenes informativas y ocultación de imágenes decorativas.</li>
            <li>Etiquetas e instrucciones comprensibles en formularios.</li>
            <li>Diseño adaptable y respeto a la preferencia de movimiento reducido.</li>
            <li>Revisión continua del contraste, el contenido y los componentes interactivos.</li>
          </ul>

          <h2>Preparación de esta declaración</h2>
          <p>
            Esta declaración se preparó el 8 de julio de 2026 mediante una autoevaluación inicial
            del sitio web. Se revisará cuando se produzcan cambios relevantes y, como mínimo, de
            forma periódica. La publicación de esta declaración no sustituye una auditoría técnica
            completa, que se incorporará al proceso de mejora.
          </p>

          <h2>Comunicación y contacto</h2>
          <p>
            Si encuentras una barrera de accesibilidad, necesitas acceder a un contenido en otro
            formato o quieres proponer una mejora, escribe a{" "}
            <a href="mailto:hola@karmafinanciero.com?subject=Accesibilidad%20web">
              hola@karmafinanciero.com
            </a>
            . Indica la página, el problema encontrado y, si es posible, el navegador o tecnología
            de asistencia utilizada. Trataremos de responder en un plazo razonable.
          </p>

          <h2>Procedimiento de reclamación</h2>
          <p>
            Si la respuesta no resulta satisfactoria, puedes acudir a los organismos competentes
            en materia de consumo, igualdad de oportunidades y derechos de las personas con
            discapacidad. También puedes presentar una consulta o queja ante la Oficina de Atención
            a la Discapacidad.
          </p>

          <h2>Marco de referencia</h2>
          <p>
            Esta declaración toma como referencia WCAG 2.1 nivel AA, la norma UNE-EN 301549, el Real
            Decreto 193/2023 y la Ley 11/2023. El Real Decreto 1112/2018 y el modelo europeo de
            declaración se utilizan como guía de estructura y transparencia, aunque su ámbito
            principal es el sector público.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
