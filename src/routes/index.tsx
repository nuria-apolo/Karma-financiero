import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import karmaLogo from "@/assets/karma-logo.svg.asset.json";
import { SiteFooter } from "@/components/SiteFooter";

const APP_URL = "https://app.karmafinanciero.com/";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Karma Financiero — Finanzas compartidas con calma" },
      {
        name: "description",
        content:
          "Organiza el dinero compartido con calma. Gestiona ingresos, gastos, objetivos y deudas en pareja o familia.",
      },
      { property: "og:title", content: "Karma Financiero — Finanzas compartidas con calma" },
      {
        property: "og:description",
        content: "Organiza el dinero que compartes con claridad y calma.",
      },
      { property: "og:url", content: "https://karmafinanciero.com/" },
    ],
    links: [{ rel: "canonical", href: "https://karmafinanciero.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Karma Financiero",
          url: "https://karmafinanciero.com/",
          logo: "https://karmafinanciero.com/favicon.png",
          description:
            "App para gestionar las finanzas compartidas del hogar con claridad y calma.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Karma Financiero",
          url: "https://karmafinanciero.com/",
        }),
      },
    ],
  }),
  component: Landing,
});

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const TABS = [
  { id: "resumen", icon: "◧", label: "Resumen del hogar" },
  { id: "objetivos", icon: "◎", label: "Objetivos" },
  { id: "deudas", icon: "◐", label: "Deudas" },
  { id: "vision", icon: "✦", label: "Visión" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Landing() {
  useReveal();
  const [activeTab, setActiveTab] = useState<TabId>("resumen");

  const plans = [
    { id: "gratis", name: "Gratis", sub: "Pruébalo sin compromiso", price: "0€", cycle: "para siempre" },
    { id: "pro", name: "Pro", sub: "Pensado para parejas", price: "2,99€", cycle: "/ mes" },
  ];
  const [activePlan, setActivePlan] = useState<string>("pro");
  const current = plans.find((p) => p.id === activePlan)!;

  return (
    <>
      <header className="site-header">
        <div className="nav-pill">
          <a href="#top" aria-label="Karma Financiero">
            <img src={karmaLogo.url} alt="Karma Financiero" className="brand-logo" />
          </a>
          <nav className="nav-links" aria-label="Principal">
            <a href="#features">Funciones</a>
            <a href="#planes">Planes</a>
            <a href="#planes">Precio</a>
            <a href="/blog">Blog</a>
          </nav>
          <a className="nav-cta" href={APP_URL} target="_blank" rel="noopener noreferrer">
            Probar gratis →
          </a>
        </div>
      </header>

      <main id="top">
        {/* HERO - Grovia style: left text + floating cards right */}
        <section className="g-hero">
          <div className="container-x g-hero-grid">
            <div className="g-hero-text">
              <h1 className="reveal">
                Gestiona lo compartido, <br />
                vive lo <em>extraordinario</em>
              </h1>
              <p className="reveal d1">
                <strong>Karma Financiero</strong> acompaña a parejas, familias y hogares para
                ordenar ingresos, gastos, deudas y objetivos en un solo lugar — sin hojas de
                cálculo ni discusiones.
              </p>
              <div className="g-hero-actions reveal d2">
                <a className="btn-pill btn-pill-dark" href={APP_URL} target="_blank" rel="noopener noreferrer">
                  Prueba gratis <span className="pill-arrow">→</span>
                </a>
                <a className="btn-pill btn-pill-ghost" href="#features">
                  Ver funciones
                </a>
              </div>
            </div>

            <div className="g-hero-cards reveal d3">
              {/* Card A: Hogar / personas */}
              <div className="g-card card-a">
                <div className="g-card-head">
                  <strong>Hogar</strong>
                  <span className="g-sort">Más reciente ▾</span>
                </div>
                <ul className="g-people">
                  <li className="active">
                    <img className="ava ava-img" src="https://i.pravatar.cc/80?img=47" alt="" />
                    <div>
                      <strong>María</strong>
                      <span>Propietario</span>
                    </div>
                    <span className="g-actions" aria-hidden="true">
                      <i>✎</i><i>☆</i><i>💬</i><i>⋯</i>
                    </span>
                  </li>
                  <li>
                    <img className="ava ava-img" src="https://i.pravatar.cc/80?img=12" alt="" />
                    <div>
                      <strong>Oscar</strong>
                      <span>Invitado</span>
                    </div>
                  </li>
                  <li>
                    <img className="ava ava-img" src="https://i.pravatar.cc/80?img=33" alt="" />
                    <div>
                      <strong>Gael</strong>
                      <span>Invitado</span>
                    </div>
                  </li>
                </ul>
                <a className="g-card-foot" href={APP_URL}>Todos los usuarios ⊕</a>
              </div>

              {/* Card B: Total ahorrado */}
              <div className="g-card card-b">
                <div className="g-card-head">
                  <span className="g-mini-label">Total Ahorrado</span>
                  <span className="g-mini-label">esta semana</span>
                </div>
                <div className="g-bignum">325,67€</div>
                <div className="g-bars" aria-hidden="true">
                  {[60, 75, 90, 80, 55, 65, 50].map((h, i) => (
                    <div key={i} className="g-bar-col">
                      <i className="seg-sage" style={{ height: `${h * 0.45}%` }} />
                      <i className="seg-yellow" style={{ height: `${h * 0.3}%` }} />
                      <i className="seg-blue" style={{ height: `${h * 0.25}%` }} />
                    </div>
                  ))}
                </div>
                <div className="g-bars-x">
                  {["M", "T", "W", "T", "O", "I", "S"].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </section>


        {/* FEATURES - tabbed (Grovia "Built for high performance") */}
        <section className="section" id="features">
          <div className="container-x">
            <p className="section-eyebrow reveal">Funciones</p>
            <h2 className="section-title reveal d1">
              Hecho para hogares, <em>impulsado por la calma</em>
            </h2>
            <p className="section-lede reveal d1">
              Karma te da todo lo necesario para alinear el dinero del hogar, hacer seguimiento real
              y crecer con confianza — todo en un mismo lugar.
            </p>

            <div className="tabs-pill reveal d2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`tab ${activeTab === t.id ? "on" : ""}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <span className="tab-ico" aria-hidden="true">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="tab-panel reveal d3">
              {activeTab === "resumen" && <PanelResumen />}
              {activeTab === "objetivos" && <PanelObjetivos />}
              {activeTab === "deudas" && <PanelDeudas />}
              {activeTab === "vision" && <PanelVision />}
            </div>
          </div>
        </section>


        {/* PRICING - dark Grovia style */}
        <section className="section" id="planes">
          <div className="container-x">
            <div className="pricing-green reveal">
              <div className="pd-head">
                <p className="pd-eyebrow">Planes flexibles</p>
                <h2>Empieza simple, <em>crece tranquilo</em></h2>
              </div>
              <div className="pd-grid">
                <ul className="pd-list">
                  {plans.map((p) => (
                    <li
                      key={p.id}
                      className={`pd-row ${activePlan === p.id ? "on" : ""}`}
                      onClick={() => setActivePlan(p.id)}
                    >
                      <div>
                        <strong>{p.name}</strong>
                        <span>{p.sub}</span>
                      </div>
                      <span className="pd-arrow">→</span>
                    </li>
                  ))}
                </ul>
                <div className="pd-detail">
                  <div className="pd-price">
                    <strong>{current.price}</strong>
                    <span>{current.cycle}</span>
                  </div>
                  <p>
                    {current.id === "gratis" &&
                      "Pruébalo gratis y siente cómo respira tu economía. Sin tarjeta, sin prisa — solo claridad."}
                    {current.id === "pro" &&
                      "Todas las funciones de Karma pensadas para parejas. Suma una persona extra por solo 1,99€/mes."}
                  </p>
                  <a className="pd-cta" href={APP_URL} target="_blank" rel="noopener noreferrer">
                    {current.id === "gratis" ? "Probar gratis" : "Empezar ahora"}{" "}
                    <span className="pill-arrow">→</span>
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
              <div className="pd-rating">
                <div className="pd-avs">
                  <span className="ava ava-sage" />
                  <span className="ava ava-yellow" />
                  <span className="ava ava-blue" />
                  <span className="ava ava-sage" />
                </div>
                <div>
                  <strong>4,9 / 5</strong>
                  <span>Hogares que respiran mejor</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUOTE */}
        <section className="quote-section">
          <div className="container-x">
            <blockquote className="reveal">
              "Tu economía del hogar también <em>puede sentirse bien</em>."
            </blockquote>
            <div className="quote-author reveal d1">
              <div className="quote-avatar" />
              <strong>Karma Financiero</strong>
              <span>Finanzas compartidas con calma</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section">
          <div className="cta-final reveal">
            <span className="eyebrow" style={{ marginBottom: "1.4rem" }}>
              <span className="dot" /> Karma Financiero
            </span>
            <h2>
              Empieza hoy. <em>Respira mejor mañana.</em>
            </h2>
            <p>
              Una forma más tranquila y bonita de llevar las finanzas que compartes. Convierte el
              dinero en una conversación más fácil.
            </p>
            <a className="btn-pill btn-pill-dark" href={APP_URL} target="_blank" rel="noopener noreferrer">
              Abrir la app <span className="pill-arrow">→</span>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />

    </>
  );
}

function PanelResumen() {
  return (
    <div className="panel-grid">
      <div className="panel-visual">
        <div className="pv-head">
          <strong>Resumen Junio</strong>
          <span className="pv-pill">Mes ▾</span>
        </div>
        <div className="pv-kpis">
          <div className="pv-k k-yellow"><span>INGRESOS</span><strong>€3.200</strong></div>
          <div className="pv-k k-gray"><span>GASTOS</span><strong>€1.760</strong></div>
          <div className="pv-k k-green"><span>DISPONIBLE</span><strong>€1.440</strong></div>
          <div className="pv-k k-white"><span>DEUDA</span><strong>€0</strong></div>
        </div>
      </div>
      <div className="panel-text">
        <p className="label">Resumen del hogar</p>
        <h3>Todo el dinero compartido, en una sola vista</h3>
        <p>
          Ingresos, gastos, disponible y deuda en un panel claro y honesto. Para que todos miren el
          mismo mapa y decidan juntos sin tensión.
        </p>
        <ul className="bullets">
          <li>Categorías personalizables</li>
          <li>Historial mes a mes</li>
          <li>Modo invitado para empezar rápido</li>
        </ul>
      </div>
    </div>
  );
}

function PanelObjetivos() {
  return (
    <div className="panel-grid">
      <div className="panel-visual">
        <div className="pv-head"><strong>Objetivos del hogar</strong><span className="pv-pill">+ Nuevo</span></div>
        <div className="mock-goals">
          <div className="g"><div className="h"><span>Viaje verano</span><strong>€1.200 / €1.800</strong></div><div className="bar"><i style={{ width: "66%" }} /></div></div>
          <div className="g"><div className="h"><span>Colchón emergencia</span><strong>€4.200 / €6.000</strong></div><div className="bar"><i style={{ width: "70%" }} /></div></div>
          <div className="g"><div className="h"><span>Entrada piso</span><strong>€8.500 / €25.000</strong></div><div className="bar"><i style={{ width: "34%" }} /></div></div>
        </div>
      </div>
      <div className="panel-text">
        <p className="label">Objetivos compartidos</p>
        <h3>Del "algún día" al primer paso real</h3>
        <p>Crea metas en pareja o familia y vélas avanzar mes a mes. Convierte conversaciones en progreso visible.</p>
        <ul className="bullets"><li>Aportes automáticos</li><li>Plazos y recordatorios</li><li>Progreso compartido</li></ul>
      </div>
    </div>
  );
}

function PanelDeudas() {
  return (
    <div className="panel-grid">
      <div className="panel-visual">
        <div className="pv-head"><strong>Deudas activas</strong><span className="pv-pill">Mes</span></div>
        <div className="mock-list">
          <div className="row"><span>Hipoteca</span><span className="tag green">Fijo</span><strong>€820</strong></div>
          <div className="row"><span>Préstamo coche</span><span className="tag blue">Fijo</span><strong>€210</strong></div>
          <div className="row"><span>Tarjeta</span><span className="tag yellow">Variable</span><strong>€85</strong></div>
        </div>
      </div>
      <div className="panel-text">
        <p className="label">Salud financiera</p>
        <h3>Controla la deuda, mide tu margen</h3>
        <p>Visualiza tu ratio de deuda y el dinero realmente disponible cada mes. Decisiones más justas y sostenibles.</p>
        <ul className="bullets"><li>Ratio de deuda</li><li>Previsión a 12 meses</li><li>Alertas de margen</li></ul>
      </div>
    </div>
  );
}

function PanelVision() {
  return (
    <div className="panel-grid">
      <div className="panel-visual">
        <div className="pv-head"><strong>Visión a 12 meses</strong><span className="pv-pill">Año</span></div>
        <svg viewBox="0 0 320 160" preserveAspectRatio="none" className="pv-chart">
          <defs>
            <linearGradient id="vg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#c3d6b6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#c3d6b6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,120 L40,110 L80,115 L120,90 L160,80 L200,60 L240,55 L280,35 L320,28 L320,160 L0,160 Z" fill="url(#vg)" />
          <path d="M0,120 L40,110 L80,115 L120,90 L160,80 L200,60 L240,55 L280,35 L320,28" fill="none" stroke="#7d9b76" strokeWidth="2.4" />
        </svg>
      </div>
      <div className="panel-text">
        <p className="label">Visión</p>
        <h3>Mira a dónde vas, no solo dónde estás</h3>
        <p>Karma proyecta tu patrimonio y tus objetivos para que sepas qué decisiones tomar ahora para vivir mejor mañana.</p>
        <ul className="bullets"><li>Proyección de patrimonio</li><li>Escenarios "qué pasaría si"</li><li>Recomendaciones suaves</li></ul>
      </div>
    </div>
  );
}
