import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CircleAlert,
  Contrast,
  Globe2,
  Keyboard,
  LaptopMinimal,
  Mail,
  RefreshCw,
  Scale,
  Smartphone,
  TextCursorInput,
} from "lucide-react";
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
      <main id="main-content" tabIndex={-1} className="accessibility-page">
        <header className="accessibility-hero">
          <div className="container-x accessibility-hero-inner">
            <span className="accessibility-kicker">
              <Check aria-hidden="true" size={15} strokeWidth={2.5} />
              Compromiso accesible
            </span>
            <h1>Declaración de accesibilidad</h1>
            <div className="accessibility-meta" aria-label="Información de la declaración">
              <span><CalendarDays aria-hidden="true" size={17} /> Revisada el 8 de julio de 2026</span>
              <span><Globe2 aria-hidden="true" size={17} /> Aplicable en España y la Unión Europea</span>
            </div>
          </div>
        </header>

        <div className="container-x accessibility-content">
          <Link to="/" className="accessibility-back">
            <ArrowLeft aria-hidden="true" size={17} /> Volver a inicio
          </Link>

          <div className="accessibility-intro">
            <p>
              En Karma Financiero queremos que ordenar la economía del hogar sea fácil para todas
              las personas, con independencia de sus capacidades, tecnología o contexto de uso.
            </p>
          </div>

          <section className="accessibility-section" aria-labelledby="accessibility-status">
            <h2 id="accessibility-status">
              <Check aria-hidden="true" /> <span>1. Situación de cumplimiento</span>
            </h2>
            <p>
              Este sitio web es <strong>parcialmente conforme</strong> con WCAG 2.1 nivel AA y
              aspira a cumplir los requisitos aplicables de la norma UNE-EN 301549. Hemos aplicado
              mejoras de estructura semántica, navegación con teclado, foco visible, alternativas
              textuales, formularios etiquetados y adaptación a distintos tamaños de pantalla.
            </p>

            <div className="accessibility-feature-grid">
              <article>
                <Keyboard aria-hidden="true" />
                <h3>Navegación por teclado</h3>
                <p>Los enlaces y controles principales pueden utilizarse sin necesidad de ratón.</p>
              </article>
              <article>
                <Contrast aria-hidden="true" />
                <h3>Contraste legible</h3>
                <p>Revisamos el contraste de textos, controles y estados para facilitar su lectura.</p>
              </article>
              <article>
                <TextCursorInput aria-hidden="true" />
                <h3>Texto ampliable</h3>
                <p>El contenido puede ampliarse desde el navegador sin perder información esencial.</p>
              </article>
              <article>
                <Smartphone aria-hidden="true" />
                <h3>Diseño adaptable</h3>
                <p>La experiencia se ajusta a móvil, tableta y escritorio de forma coherente.</p>
              </article>
            </div>
          </section>

          <section className="accessibility-section" aria-labelledby="accessibility-measures">
            <h2 id="accessibility-measures">
              <LaptopMinimal aria-hidden="true" /> <span>2. Medidas adoptadas</span>
            </h2>
            <p>El sitio se ha construido y revisado aplicando estas medidas:</p>
            <ul>
              <li>Estructura de encabezados y regiones semánticas para facilitar la navegación.</li>
              <li>Acceso mediante teclado y estilos de foco claramente visibles.</li>
              <li>Textos alternativos en imágenes informativas y ocultación de las decorativas.</li>
              <li>Etiquetas e instrucciones comprensibles en formularios.</li>
              <li>Diseño adaptable y respeto a la preferencia de movimiento reducido.</li>
              <li>Revisión continua del contraste, el contenido y los componentes interactivos.</li>
            </ul>
          </section>

          <section className="accessibility-section" aria-labelledby="accessibility-limitations">
            <h2 id="accessibility-limitations">
              <CircleAlert aria-hidden="true" /> <span>3. Limitaciones conocidas</span>
            </h2>
            <p>Aún estamos revisando el contenido y las integraciones para confirmar su conformidad completa:</p>
            <ul>
              <li>Algunas imágenes o contenidos antiguos del blog pueden necesitar una descripción más detallada.</li>
              <li>Determinados servicios de terceros pueden no ofrecer el mismo nivel de accesibilidad.</li>
              <li>Algunas combinaciones de navegador y tecnología de asistencia aún no se han verificado.</li>
            </ul>
            <aside className="accessibility-note accessibility-note-warning">
              No se invoca ninguna excepción por carga desproporcionada. Trabajamos para corregir
              las barreras detectadas de manera progresiva.
            </aside>
          </section>

          <section className="accessibility-section" aria-labelledby="accessibility-contact">
            <h2 id="accessibility-contact">
              <Mail aria-hidden="true" /> <span>4. Comunicación y contacto</span>
            </h2>
            <p>
              Si encuentras una barrera, necesitas un contenido en otro formato o quieres proponer
              una mejora, cuéntanoslo. Indica la página, el problema y, si es posible, el navegador
              o tecnología de asistencia utilizada.
            </p>
            <aside className="accessibility-note accessibility-note-contact">
              <strong>Correo electrónico</strong>
              <a href="mailto:hola@karmafinanciero.com?subject=Accesibilidad%20web">
                hola@karmafinanciero.com
              </a>
              <span>Trataremos de responder en un plazo razonable.</span>
            </aside>
          </section>

          <section className="accessibility-section" aria-labelledby="accessibility-claim">
            <h2 id="accessibility-claim">
              <Scale aria-hidden="true" /> <span>5. Procedimiento de reclamación</span>
            </h2>
            <p>
              Si la respuesta no resulta satisfactoria, puedes acudir a los organismos competentes
              en materia de consumo, igualdad de oportunidades y derechos de las personas con
              discapacidad. También puedes presentar una consulta o queja ante la Oficina de
              Atención a la Discapacidad.
            </p>
          </section>

          <section className="accessibility-section" aria-labelledby="accessibility-preparation">
            <h2 id="accessibility-preparation">
              <RefreshCw aria-hidden="true" /> <span>6. Preparación y actualización</span>
            </h2>
            <p>
              Esta declaración se preparó el 8 de julio de 2026 mediante una autoevaluación inicial.
              Se revisará cuando haya cambios relevantes y de forma periódica. Su publicación no
              sustituye una auditoría técnica completa, que se incorporará al proceso de mejora.
            </p>
            <p className="accessibility-framework">
              <strong>Marco de referencia:</strong> WCAG 2.1 nivel AA, UNE-EN 301549, Real Decreto
              193/2023 y Ley 11/2023. El Real Decreto 1112/2018 y el modelo europeo de declaración
              se utilizan como guía de estructura y transparencia, aunque su ámbito principal es
              el sector público.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
