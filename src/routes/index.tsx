import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import karmaHeroPhoto from "@/assets/karma-hero-photo-lima.png";
import karmaLoNuestroPhoneMockup from "@/assets/karma-lo-nuestro-phone-mockup.png";
import karmaGastosCompartidosGrupo from "@/assets/karma-gastos-compartidos-grupo.png";
import karmaDosParejasCompra from "@/assets/karma-dos-parejas-compra.png";
import appDemoDeudas from "@/assets/app-demo-deudas.png";
import appDemoSuscripciones from "@/assets/app-demo-suscripciones.png";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buildSeoHead, fetchSeoPage, SEO_CONTENT_HEADERS } from "@/lib/seo-cms";

const WAITLIST_URL = "/lista-espera";
const DEMO_URL = "https://app.karmafinanciero.com/demo";

const FAQS = [
  {
    question: "¿Qué es Karma Financiero y para qué sirve?",
    answer:
      "Karma Financiero es una app para poner orden en las finanzas del hogar. Reúne gastos compartidos, ingresos, deudas y objetivos para que sepáis qué pasa con el dinero sin tener que reconstruirlo entre chats y hojas de cálculo.",
  },
  {
    question: "¿Cómo podemos repartir los gastos en pareja?",
    answer:
      "Podéis separar lo de cada uno de lo que pagáis en común y elegir una regla que os encaje: mitad y mitad, según vuestros ingresos o un reparto personalizado. Así queda claro cuánto aporta cada persona.",
  },
  {
    question: "¿Puedo probar la app antes de apuntarme a la lista de espera?",
    answer:
      "Sí. La demo pública te deja recorrer las pantallas y registrar operaciones con datos de ejemplo, sin crear una cuenta. Al recargar, los cambios de la demo se reinician.",
  },
];

export const Route = createFileRoute("/")({
  loader: () => fetchSeoPage("/"),
  headers: () => SEO_CONTENT_HEADERS,
  head: ({ loaderData }) =>
    buildSeoHead({
      seo: loaderData,
      defaults: {
        path: "/",
        title: "Gastos compartidos en pareja y familia | Karma Financiero",
        description:
          "Pon orden en los gastos compartidos: separa lo tuyo de lo común, reparte los gastos en pareja y ten a la vista deudas y pagos del hogar.",
        image: "/head-icon.png",
      },
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Karma Financiero",
            url: "https://karmafinanciero.com/",
            logo: "https://karmafinanciero.com/head-icon.png",
            description:
              "App para gestionar finanzas compartidas, gastos del hogar, presupuesto familiar y objetivos en pareja con claridad y calma.",
            sameAs: [
              "https://www.instagram.com/karmafinanciero/",
              "https://www.linkedin.com/company/karma-financiero/",
              "https://grounded-focus-364680.framer.app/sobre-mi",
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Karma Financiero",
            url: "https://karmafinanciero.com/",
            inLanguage: "es",
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Karma Financiero",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            url: "https://karmafinanciero.com/",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            description:
              "App para organizar gastos compartidos, presupuesto familiar, deudas y objetivos financieros del hogar.",
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        },
      ],
    }),
  component: Landing,
});

const PLANS = [
  {
    id: "gratis",
    name: "Gratis",
    sub: "Para empezar con calma",
    price: "0€",
    cycle: "para siempre",
  },
  { id: "pro", name: "Pro", sub: "Pensado para parejas", price: "2,99€", cycle: "/ mes" },
] as const;

function Landing() {
  const [activePlan, setActivePlan] = useState<(typeof PLANS)[number]["id"]>("pro");
  const [expenseScope, setExpenseScope] = useState<"shared" | "personal">("shared");
  const [splitRule, setSplitRule] = useState<"income" | "equal">("income");
  const current = PLANS.find((plan) => plan.id === activePlan)!;

  return (
    <div className="home-landing">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="g-hero sales-hero">
          <div className="container-x sales-hero-grid">
            <div className="g-hero-text sales-hero-copy">
              <h1 className="reveal">
                Gastos compartidos, <span>sin el «luego te hago Bizum»</span>
              </h1>
              <p className="reveal d1">
                La compra, el alquiler, esa cena que pagaste tú… Organizar los gastos en pareja o en
                casa no debería exigir un máster en mensajes. Con Karma podéis separar lo vuestro de
                lo de cada uno, elegir cómo repartirlo y ver qué queda por pagar.
              </p>
              <div className="g-hero-actions reveal d2">
                <a className="btn-pill btn-pill-dark" href={WAITLIST_URL}>
                  Unirme a la lista de espera
                </a>
                <a
                  className="btn-pill btn-pill-ghost"
                  href={DEMO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explorar la demo ↗
                </a>
              </div>
            </div>
            <figure className="sales-hero-photo reveal d2">
              <img
                src={karmaHeroPhoto}
                alt="Portátil amarillo lima sostenido entre las manos, con una representación del resumen financiero de Karma en pantalla sobre un cielo azul"
                width={1448}
                height={1086}
                fetchPriority="high"
              />
            </figure>
          </div>
        </section>

        <section className="sales-proof-strip" aria-label="Qué puedes explorar en la demo">
          <ul className="container-x sales-proof-grid">
            <li>Lo tuyo, lo mío y lo nuestro: cada cosa en su sitio</li>
            <li>Los gastos comunes, repartidos como acordéis</li>
            <li>Deudas y suscripciones, sin rebuscar</li>
          </ul>
        </section>

        <section className="section sales-showcase" id="features">
          <div className="container-x">
            <h2 className="section-title reveal">Las cuentas de casa, claras como el agua.</h2>
            <p className="section-lede reveal d1">
              Del gasto compartido al pago que viene el mes que viene. Todo fácil, claro y común.
              Puedes abrirla y probarla.
            </p>

            <article className="sales-feature sales-feature-main reveal">
              <div className="sales-feature-copy">
                <h3>Tu dinero por un lado. El de casa, por otro.</h3>
                <p>
                  Mira tu cuenta personal y «Lo nuestro» sin juntar en el mismo saco tus gastos, los
                  gastos comunes y lo que aún debéis.
                </p>
                <ul>
                  <li>Ingresos personales y gastos compartidos, separados</li>
                  <li>Movimientos recientes y gastos por categoría</li>
                  <li>Balance común de un vistazo</li>
                </ul>
                <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Ver esta pantalla en la demo ↗
                </a>
              </div>
              <figure className="sales-screen sales-screen-shared">
                <img
                  src={karmaLoNuestroPhoneMockup}
                  alt="Móvil en manos con la vista Lo nuestro de Karma Financiero: fondo, gastos, balance y deuda común"
                  width={1086}
                  height={1448}
                  loading="lazy"
                />
              </figure>
            </article>

            <article className="sales-feature sales-feature-main sales-feature-reverse reveal">
              <figure className="sales-operation-photo">
                <img
                  className="sales-operation-photo-main"
                  src={karmaGastosCompartidosGrupo}
                  alt="Grupo de amigos mirando sus móviles mientras organizan un gasto compartido"
                  width={1448}
                  height={1086}
                  loading="lazy"
                />
                <div
                  className="sales-operation-glass"
                  aria-label="Vista ilustrativa de una nueva operación"
                >
                  <span className="sales-operation-glass-label">Nueva operación</span>
                  <strong aria-live="polite">
                    {expenseScope === "shared" ? "Gasto compartido" : "Gasto personal"}
                  </strong>
                  <div className="sales-operation-glass-options">
                    <button
                      type="button"
                      aria-pressed={expenseScope === "personal"}
                      onClick={() => setExpenseScope("personal")}
                    >
                      Personal
                    </button>
                    <button
                      type="button"
                      aria-pressed={expenseScope === "shared"}
                      onClick={() => setExpenseScope("shared")}
                    >
                      Compartido
                    </button>
                  </div>
                  <small>
                    {expenseScope === "shared" ? "Reparto según ingresos" : "Solo en tu cuenta"}
                  </small>
                </div>
              </figure>
              <div className="sales-feature-copy">
                <h3>¿Lo pagaste tú o lo pagasteis entre todos?</h3>
                <p>
                  Apunta esa compra cuando aún te acuerdas. Elige si es un gasto personal o
                  compartido, ponle categoría y deja claro cómo se reparte.
                </p>
                <ul>
                  <li>Fecha, importe y categoría en un solo sitio</li>
                  <li>Mitad y mitad, según ingresos o a vuestra manera</li>
                  <li>También puedes marcar los pagos recurrentes</li>
                </ul>
                <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Probar una operación en la demo ↗
                </a>
              </div>
            </article>

            <article className="sales-feature sales-feature-main reveal">
              <div className="sales-feature-copy">
                <h3>El 50/50 no siempre es lo más justo.</h3>
                <p>
                  Repartid los gastos de pareja, familia o piso con la regla que hayáis acordado.
                  Podéis dividir gastos, gestionar dinero en común o hacer ambas cosas.
                </p>
                <ul>
                  <li>Acuerdos para pareja, familia, piso o viaje</li>
                  <li>Reparto al 50/50, según ingresos o personalizado</li>
                  <li>Qué aporta cada persona y cuánto queda en común</li>
                </ul>
                <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Probar un acuerdo en la demo ↗
                </a>
              </div>
              <figure className="sales-agreement-photo">
                <img
                  src={karmaDosParejasCompra}
                  alt="Dos parejas comprando alimentos juntas en un mercado"
                  width={1448}
                  height={1086}
                  loading="lazy"
                />
                <div className="sales-agreement-glass" aria-label="Ejemplo interactivo de reparto">
                  <div className="sales-agreement-glass-main">
                    <div className="sales-agreement-glass-copy">
                      <span>Ejemplo de reparto</span>
                      <strong>Pareja: ambas cosas</strong>
                      <small aria-live="polite">
                        Regla: {splitRule === "income" ? "según ingresos" : "mitad y mitad"}
                      </small>
                    </div>
                    <div className="sales-agreement-glass-metric">
                      <span>Tu aportación</span>
                      <strong aria-live="polite">{splitRule === "income" ? "60%" : "50%"}</strong>
                    </div>
                  </div>
                  <div className="sales-demo-controls" aria-label="Elegir ejemplo de reparto">
                    <button
                      type="button"
                      aria-pressed={splitRule === "equal"}
                      onClick={() => setSplitRule("equal")}
                    >
                      50/50
                    </button>
                    <button
                      type="button"
                      aria-pressed={splitRule === "income"}
                      onClick={() => setSplitRule("income")}
                    >
                      Según ingresos
                    </button>
                  </div>
                </div>
              </figure>
            </article>

            <div className="sales-feature-pair">
              <article className="sales-feature-card reveal">
                <figure className="sales-screen">
                  <img
                    src={appDemoDeudas}
                    alt="Pantalla de deudas e hipotecas de la demo con importes pendientes, cuotas y progreso de pago"
                    width={1600}
                    height={900}
                    loading="lazy"
                  />
                </figure>
                <div className="sales-feature-card-copy">
                  <h3>La deuda no desaparece por no mirarla.</h3>
                  <p>
                    Ten a mano lo que queda por pagar, las cuotas de cada mes y cuánto habéis
                    avanzado.
                  </p>
                </div>
              </article>
              <article className="sales-feature-card reveal d1">
                <figure className="sales-screen">
                  <img
                    src={appDemoSuscripciones}
                    alt="Pantalla de suscripciones de la demo con coste mensual, renovación y lista de servicios"
                    width={1600}
                    height={900}
                    loading="lazy"
                  />
                </figure>
                <div className="sales-feature-card-copy">
                  <h3>La suscripción que olvidaste cancelar también cuenta.</h3>
                  <p>
                    Mira cuánto suman tus suscripciones al mes y cuándo se renueva cada una, sin
                    buscarlas una por una.
                  </p>
                </div>
              </article>
            </div>
            <div className="sales-demo-cta reveal">
              <p>¿Te suena alguna de estas situaciones? Prueba cómo funciona.</p>
              <a
                className="btn-pill btn-pill-dark"
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir demo interactiva ↗
              </a>
            </div>
          </div>
        </section>

        <section className="section" id="planes">
          <div className="container-x">
            <div className="pricing-green reveal">
              <div className="pd-head">
                <h2>Empieza por poner las cuentas claras</h2>
              </div>
              <div className="pd-grid">
                <ul className="pd-list">
                  {PLANS.map((plan) => (
                    <li key={plan.id}>
                      <button
                        type="button"
                        className={`pd-row ${activePlan === plan.id ? "on" : ""}`}
                        onClick={() => setActivePlan(plan.id)}
                        aria-pressed={activePlan === plan.id}
                      >
                        <span className="pd-row-copy">
                          <strong>{plan.name}</strong>
                          <span>{plan.sub}</span>
                        </span>
                        <span className="pd-arrow" aria-hidden="true">
                          →
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="pd-detail">
                  <div className="pd-price">
                    <strong>{current.price}</strong>
                    <span>{current.cycle}</span>
                  </div>
                  <p>
                    {current.id === "gratis"
                      ? "Para saber por dónde se va el dinero de casa. Sin tarjeta y sin prisa."
                      : "Para mirar un poco más allá del gasto de hoy y organizar lo que compartís."}
                  </p>
                  <a className="pd-cta" href={WAITLIST_URL}>
                    Apuntarme a la lista de espera
                  </a>
                  <ul className="pd-features">
                    {current.id === "gratis" ? (
                      <>
                        <li>✓ Resumen del hogar</li>
                        <li>✓ Ingresos, gastos y categorías</li>
                        <li>✓ 1 objetivo compartido</li>
                        <li>✓ Acceso para 1 persona</li>
                      </>
                    ) : (
                      <>
                        <li>✓ Todo lo del plan Gratis</li>
                        <li>✓ Objetivos ilimitados</li>
                        <li>✓ Deudas, inversiones y previsión</li>
                        <li>✓ 2 personas incluidas (pareja)</li>
                        <li>✓ +1,99€/mes por usuario extra</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              <p className="sales-plan-note">
                Estamos abriendo el acceso poco a poco. Apuntarte a la lista no activa ningún pago.
              </p>
            </div>
          </div>
        </section>

        <section className="section home-faq" aria-labelledby="home-faq-title">
          <div className="container-x">
            <div className="home-faq-head reveal">
              <h2 id="home-faq-title">Lo que quizá te estés preguntando</h2>
            </div>
            <div className="home-faq-grid">
              {FAQS.map((faq, index) => (
                <details
                  className="home-faq-card reveal"
                  style={{ animationDelay: `${index * 70}ms` }}
                  key={faq.question}
                >
                  <summary>
                    <span>{faq.question}</span>
                    <span className="home-faq-toggle" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
            <div className="home-faq-links reveal d1">
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                Explorar la demo
              </a>
              <a href={WAITLIST_URL}>Unirme a la lista de espera</a>
            </div>
          </div>
        </section>

        <section className="section home-final-section">
          <div className="cta-final reveal">
            <h2>Que hablar de dinero en casa sea más fácil.</h2>
            <p>
              Cotillea la demo con datos de ejemplo y apúntate a la lista para saber cuándo podrás
              usar Karma con tus propios datos.
            </p>
            <a className="btn-pill btn-pill-dark" href={WAITLIST_URL}>
              Unirme a la lista de espera
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
