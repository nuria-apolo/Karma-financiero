import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import karmaLogo from "@/assets/karma-logo.svg.asset.json";

const APP_URL = "https://app.karmafinanciero.com/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Karma Financiero — Finanzas compartidas con calma" },
      {
        name: "description",
        content:
          "Organiza el dinero que compartes con claridad, calma y estilo. Karma Financiero te ayuda a gestionar ingresos, gastos, objetivos y deudas en pareja, familia o convivencia.",
      },
      { property: "og:title", content: "Karma Financiero — Finanzas compartidas con calma" },
      {
        property: "og:description",
        content: "Organiza el dinero que compartes con claridad, calma y estilo.",
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

function Landing() {
  useReveal();



  return (
    <>
      <header className="site-header">
        <div className="nav-pill">
          <a href="#top" aria-label="Karma Financiero">
            <img src={karmaLogo.url} alt="Karma Financiero" className="brand-logo" />
          </a>
          <nav className="nav-links" aria-label="Principal">
            <a href="#features">Funciones</a>
            <a href="#beneficios">Beneficios</a>
            <a href="#planes">Planes</a>
            <a href="/blog">Blog</a>
          </nav>
          <a className="nav-cta" href={APP_URL} target="_blank" rel="noopener noreferrer">
            Probar gratis
          </a>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <span className="cloud cloud-1" aria-hidden="true" />
          <span className="cloud cloud-2" aria-hidden="true" />
          <span className="cloud cloud-3" aria-hidden="true" />
          <span className="cloud cloud-4" aria-hidden="true" />

          <div className="container-x" style={{ position: "relative", zIndex: 2 }}>
            <span className="eyebrow reveal">
              <span className="dot" /> Finanzas compartidas con calma
            </span>
            <h1 className="reveal d1">
              Ordena el dinero <br />
              que <em>compartes</em>.
            </h1>
            <p className="hero-sub reveal d2">
              Plataforma todo-en-uno para gestionar ingresos, gastos, deudas y objetivos del hogar
              sin caos. Desde la primera conversación hasta el último ahorro, te cubre.
            </p>
            <div className="hero-actions reveal d3">
              <a className="btn btn-primary" href={APP_URL} target="_blank" rel="noopener noreferrer">
                Probar gratis
              </a>
              <a className="btn btn-soft" href="#features">
                Ver funciones
              </a>
            </div>
          </div>

          <div className="hero-device-wrap reveal d4">
            <div className="hero-device">
              <div className="device-inner">
                <div className="app-topbar">
                  <span className="app-brand">
                    Karma <i aria-hidden="true">𝄁</i> Financiero
                  </span>
                  <div className="app-topbar-actions">
                    <button type="button" className="icon-btn" aria-label="Actualizar">↻</button>
                    <button type="button" className="icon-btn" aria-label="Ajustes">⚙</button>
                    <span className="avatar" aria-hidden="true" />
                  </div>
                </div>

                <div className="app-greet">
                  <h4>Hola Invitado</h4>
                  <p>tu resumen financiero.</p>
                </div>

                <div className="app-period">
                  <div>
                    <h5>Ingresos, gastos, disponible y deuda</h5>
                    <span>Junio De 2026</span>
                  </div>
                  <div className="period-controls">
                    <div className="seg">
                      <button type="button" className="active">Mes</button>
                      <button type="button">Año</button>
                    </div>
                    <div className="month-picker">
                      <span>‹</span>
                      <strong>Junio De 2026</strong>
                      <span>›</span>
                    </div>
                  </div>
                </div>

                <div className="kpis">
                  <div className="kpi k-yellow">
                    <div className="kpi-head"><span className="kpi-ico">↗</span><span className="kpi-label">INGRESOS</span></div>
                    <strong>0,00 €</strong>
                    <em>Total Recibido</em>
                  </div>
                  <div className="kpi k-gray">
                    <div className="kpi-head"><span className="kpi-ico">↘</span><span className="kpi-label">GASTOS</span></div>
                    <strong>0,00 €</strong>
                    <em>Total Gastado</em>
                  </div>
                  <div className="kpi k-green">
                    <div className="kpi-head"><span className="kpi-ico">▢</span><span className="kpi-label">DISPONIBLE</span></div>
                    <strong>0,00 €</strong>
                    <em>Patrimonio Neto</em>
                  </div>
                  <div className="kpi k-white">
                    <div className="kpi-head"><span className="kpi-ico kpi-ico-red">◎</span><span className="kpi-label">DEUDA</span></div>
                    <strong>0,00 €</strong>
                    <em>100% Cubierto</em>
                  </div>
                </div>

                <div className="app-bottomnav" aria-hidden="true">
                  <span className="bn active">▦<i>Resumen</i></span>
                  <span className="bn">💵<i>Deudas</i></span>
                  <span className="bn">📈<i>Inversiones</i></span>
                  <span className="bn">🏷<i>Categorías</i></span>
                  <span className="bn">✨<i>Visión</i></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE ROWS */}
        <section className="section" id="features">
          <div className="container-x">
            <p className="section-eyebrow reveal">Funciones</p>
            <h2 className="section-title reveal d1">
              Hecho para hogares, <em>impulsado por la calma</em>
            </h2>

            <div className="feature-row reveal">
              <div className="feature-text">
                <p className="label">Visión compartida</p>
                <h3>Todo el dinero del hogar, en una sola vista</h3>
                <p>
                  Centraliza ingresos, gastos, deudas y patrimonio en un panel claro. Sin hojas de
                  cálculo, sin apps frías. Para que todos miren el mismo mapa y decidan juntos.
                </p>
                <div className="chips">
                  <span className="chip">📊 Resumen</span>
                  <span className="chip">📁 Categorías</span>
                  <span className="chip">📜 Historial</span>
                  <span className="chip">👥 Multi-usuario</span>
                </div>
              </div>
              <div className="feature-card">
                <div className="inner">
                  <div className="mock-list">
                    <div className="row">
                      <span>Hipoteca</span>
                      <span className="tag green">Fijo</span>
                      <strong>€820</strong>
                    </div>
                    <div className="row">
                      <span>Supermercado</span>
                      <span className="tag yellow">Variable</span>
                      <strong>€430</strong>
                    </div>
                    <div className="row">
                      <span>Suministros</span>
                      <span className="tag blue">Fijo</span>
                      <strong>€180</strong>
                    </div>
                    <div className="row">
                      <span>Ocio compartido</span>
                      <span className="tag yellow">Variable</span>
                      <strong>€140</strong>
                    </div>
                    <div className="row">
                      <span>Ahorro objetivo</span>
                      <span className="tag green">Auto</span>
                      <strong>€300</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-row reverse reveal">
              <div className="feature-text">
                <p className="label">Salud financiera</p>
                <h3>Controla la deuda, mide tu margen, respira mejor</h3>
                <p>
                  Visualiza tu ratio de deuda y el dinero realmente disponible cada mes. Karma te
                  ayuda a tomar decisiones más justas y sostenibles, sin la carga mental de siempre.
                </p>
                <div className="chips">
                  <span className="chip">💳 Deuda</span>
                  <span className="chip">📈 Previsión</span>
                  <span className="chip">⚖️ Balance</span>
                </div>
              </div>
              <div className="feature-card blue">
                <div className="inner">
                  <div className="mock-budget">
                    <div className="row2">
                      <div className="b">
                        <span>Disponible</span>
                        <strong>€1.440</strong>
                      </div>
                      <div className="b">
                        <span>Margen</span>
                        <strong>42%</strong>
                      </div>
                    </div>
                    <svg viewBox="0 0 300 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#c3d6b6" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#c3d6b6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,90 L30,80 L60,85 L90,70 L120,60 L150,65 L180,45 L210,50 L240,35 L270,28 L300,22 L300,120 L0,120 Z"
                        fill="url(#g1)"
                      />
                      <path
                        d="M0,90 L30,80 L60,85 L90,70 L120,60 L150,65 L180,45 L210,50 L240,35 L270,28 L300,22"
                        fill="none"
                        stroke="#7d9b76"
                        strokeWidth="2.2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-row reveal">
              <div className="feature-text">
                <p className="label">Objetivos compartidos</p>
                <h3>Del "algún día" al primer paso real</h3>
                <p>
                  Crea metas en pareja o familia y velas avanzar mes a mes. Un viaje, un colchón de
                  seguridad, una entrada de piso. Convierte conversaciones en progreso visible.
                </p>
                <div className="chips">
                  <span className="chip">🎯 Metas</span>
                  <span className="chip">📅 Plazos</span>
                  <span className="chip">🤝 En pareja</span>
                </div>
              </div>
              <div className="feature-card yellow">
                <div className="inner">
                  <div className="mock-goals">
                    <div className="g">
                      <div className="h">
                        <span>Viaje verano</span>
                        <strong>€1.200 / €1.800</strong>
                      </div>
                      <div className="bar">
                        <i style={{ width: "66%" }} />
                      </div>
                    </div>
                    <div className="g">
                      <div className="h">
                        <span>Colchón emergencia</span>
                        <strong>€4.200 / €6.000</strong>
                      </div>
                      <div className="bar">
                        <i style={{ width: "70%" }} />
                      </div>
                    </div>
                    <div className="g">
                      <div className="h">
                        <span>Entrada piso</span>
                        <strong>€8.500 / €25.000</strong>
                      </div>
                      <div className="bar">
                        <i style={{ width: "34%" }} />
                      </div>
                    </div>
                    <div className="g">
                      <div className="h">
                        <span>Reforma cocina</span>
                        <strong>€1.500 / €3.000</strong>
                      </div>
                      <div className="bar">
                        <i style={{ width: "50%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO BENEFICIOS */}
        <section className="section" id="beneficios">
          <div className="container-x">
            <p className="section-eyebrow reveal">Beneficios</p>
            <h2 className="section-title reveal d1">
              Menos tensión, <em>más claridad</em>
            </h2>
            <div className="bento">
              <div className="b large reveal">
                <span className="ico">🧘</span>
                <p>
                  Karma Financiero no nace para vigilar gastos, sino para dar claridad al dinero
                  compartido y bajar la carga mental que suele traer.
                </p>
                <h4>Una experiencia editorial, no una hoja de cálculo</h4>
              </div>
              <div className="b reveal d1">
                <span className="ico">💬</span>
                <p>Hablar de dinero deja de ser fuente de tensión cuando todos miran el mismo mapa.</p>
                <h4>Mejores conversaciones</h4>
              </div>
              <div className="b reveal">
                <span className="ico">🌱</span>
                <p>No solo registrar: crear una forma más sana de organizarse, mes a mes.</p>
                <h4>Hábitos sostenibles</h4>
              </div>
              <div className="b reveal d1">
                <span className="ico">👁️</span>
                <p>Visualiza lo importante sin perderte en apps recargadas ni cifras opacas.</p>
                <h4>Claridad diaria</h4>
              </div>
              <div className="b large reveal d2">
                <span className="ico">🏡</span>
                <p>
                  Pensada para pareja, familia o convivencia. Espacios compartidos donde cada uno
                  aporta y todos ven el resultado.
                </p>
                <h4>Para el hogar real, no para una sola persona</h4>
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

        {/* PRICING */}
        <section className="section" id="planes">
          <div className="container-x">
            <p className="section-eyebrow reveal">Planes</p>
            <h2 className="section-title reveal d1">
              Empieza simple, <em>crece tranquilo</em>
            </h2>
            <div className="pricing-grid">
              <article className="pricing-card reveal">
                <h3>Gratis</h3>
                <div className="price">€0</div>
                <p>Para probar el sistema y empezar a ordenar tus números sin barreras.</p>
                <ul>
                  <li>Resumen financiero</li>
                  <li>Registro de ingresos y gastos</li>
                  <li>Modo invitado para empezar rápido</li>
                </ul>
                <a className="btn btn-soft" href={APP_URL} target="_blank" rel="noopener noreferrer">
                  Entrar ahora
                </a>
              </article>
              <article className="pricing-card highlight reveal d1">
                <h3>Próximamente Pro</h3>
                <div className="price">Hogar</div>
                <p>
                  Para quienes quieren compartir mejor, planificar objetivos y construir su buen
                  karma financiero en serio.
                </p>
                <ul>
                  <li>Espacios compartidos</li>
                  <li>Más automatización y seguimiento</li>
                  <li>Funciones para pareja y familia</li>
                </ul>
                <a className="btn btn-primary" href={APP_URL} target="_blank" rel="noopener noreferrer">
                  Ver la demo
                </a>
              </article>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
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
            <a className="btn btn-primary" href={APP_URL} target="_blank" rel="noopener noreferrer">
              Abrir la app
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container-x footer-grid">
          <div>© 2026 Karma Financiero — Finanzas compartidas con calma.</div>
          <a href={APP_URL} target="_blank" rel="noopener noreferrer">
            app.karmafinanciero.com
          </a>
        </div>
      </footer>
    </>
  );
}
