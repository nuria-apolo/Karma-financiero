import { createFileRoute } from "@tanstack/react-router";
import karmaLogo from "@/assets/karma-logo.svg.asset.json";
import karmaIcon from "@/assets/karma-icon.png.asset.json";


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
        content:
          "Organiza el dinero que compartes con claridad, calma y estilo.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <>
      <header className="site-header">
        <div className="container-x nav">
          <a href="#top" className="brand">Karma Financiero</a>
          <nav className="nav-links" aria-label="Principal">
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#beneficios">Beneficios</a>
            <a href="#planes">Planes</a>
          </nav>
          <div className="btns">
            <a className="btn btn-soft" href={APP_URL} target="_blank" rel="noopener noreferrer">Ver app</a>
            <a className="btn btn-primary" href={APP_URL} target="_blank" rel="noopener noreferrer">Empieza gratis</a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="section">
          <div className="container-x hero-grid">
            <div className="hero-copy">
              <div>
                <div className="eyebrow"><span className="dot"></span> Finanzas compartidas con calma</div>
                <h1>Ordena el dinero que compartes.</h1>
              </div>
              <div>
                <p className="lead">Karma Financiero convierte los gastos, ingresos, deudas y objetivos del hogar en una experiencia clara, bonita y fácil de sostener.</p>
                <p className="sublead">Pensada para pareja, familia o convivencia. Menos tensión al hablar de dinero. Más visibilidad para decidir juntos.</p>
              </div>
              <div className="hero-actions">
                <a className="btn btn-primary" href={APP_URL} target="_blank" rel="noopener noreferrer">Probar la app</a>
                <a className="btn btn-soft" href="#como-funciona">Ver cómo funciona</a>
              </div>
            </div>

            <div className="hero-card" aria-label="Vista previa de la app">
              <div className="eyebrow">Tu resumen financiero</div>
              <div className="mockup">
                <div className="mockup-header">
                  <span>Hola, invitado</span>
                  <span>Junio</span>
                </div>
                <div className="kpi-grid">
                  <div className="kpi"><span>Ingresos</span><strong>€0</strong></div>
                  <div className="kpi"><span>Gastos</span><strong>€0</strong></div>
                  <div className="kpi"><span>Disponible</span><strong>€0</strong></div>
                  <div className="kpi"><span>Deuda</span><strong>0%</strong></div>
                </div>
                <div className="mini-list">
                  <div className="mini-item"><span>Objetivos activos</span><strong>0</strong></div>
                  <div className="mini-item"><span>Movimientos</span><strong>Vacío</strong></div>
                  <div className="mini-item"><span>Modo</span><strong>Invitado</strong></div>
                </div>
              </div>
              <p className="sublead">La app actual muestra un dashboard con resumen financiero, objetivos, desglose de gastos e historial, incluso en modo invitado.</p>
            </div>
          </div>
        </section>

        <section className="section" id="como-funciona">
          <div className="container-x">
            <div className="stats-row">
              <article className="panel soft-green">
                <h3>1. Mira tu realidad</h3>
                <p>Registra ingresos, gastos, deuda y patrimonio en un mismo lugar para entender cómo está de verdad tu economía doméstica.</p>
              </article>
              <article className="panel soft-yellow">
                <h3>2. Comparte sin fricción</h3>
                <p>Crea un sistema común para pareja, familia o piso y evita conversaciones eternas sobre quién pagó qué o cuánto queda este mes.</p>
              </article>
              <article className="panel soft-blue">
                <h3>3. Decide mejor</h3>
                <p>Usa objetivos y seguimiento para convertir el dinero en decisiones más tranquilas, más justas y más sostenibles.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container-x story">
            <div className="quote">
              <p>Tu economía del hogar también puede sentirse bien.</p>
              <p className="sublead">Karma Financiero no nace para vigilar gastos, sino para dar claridad al dinero compartido y bajar la carga mental que suele traer.</p>
            </div>
            <div className="panel">
              <h2>Una app que habla el lenguaje de casa</h2>
              <p>Las herramientas financieras suelen ser frías, técnicas o pensadas para una sola persona. Karma Financiero propone otra cosa: una experiencia editorial, serena y compartida para quienes viven juntos, ahorran juntos o simplemente necesitan ordenar mejor su día a día.</p>
            </div>
          </div>
        </section>

        <section className="section" id="beneficios">
          <div className="container-x">
            <h2>Qué te llevas</h2>
            <div className="feature-grid">
              <article className="feature">
                <h3>Claridad diaria</h3>
                <p>Visualiza lo importante sin perderte en hojas de cálculo o apps recargadas.</p>
                <ul>
                  <li>Resumen financiero simple</li>
                  <li>Historial y movimientos</li>
                  <li>Desglose de gastos</li>
                </ul>
              </article>
              <article className="feature">
                <h3>Mejores conversaciones</h3>
                <p>Hablar de dinero deja de ser una fuente de tensión cuando todos miran el mismo mapa.</p>
                <ul>
                  <li>Visión compartida del hogar</li>
                  <li>Más transparencia</li>
                  <li>Menos discusiones repetidas</li>
                </ul>
              </article>
              <article className="feature">
                <h3>Hábitos sostenibles</h3>
                <p>No se trata solo de registrar, sino de crear una forma más sana de organizarse.</p>
                <ul>
                  <li>Seguimiento de objetivos</li>
                  <li>Control de deuda</li>
                  <li>Rutina financiera más calmada</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="planes">
          <div className="container-x">
            <h2>Empieza simple</h2>
            <div className="pricing-grid">
              <article className="pricing">
                <h3>Gratis</h3>
                <div className="price">€0</div>
                <p>Para probar el sistema y empezar a ordenar tus números sin barreras.</p>
                <ul className="list">
                  <li>Resumen financiero</li>
                  <li>Registro de ingresos y gastos</li>
                  <li>Modo invitado para empezar rápido</li>
                </ul>
                <a className="btn btn-soft" href={APP_URL} target="_blank" rel="noopener noreferrer">Entrar ahora</a>
              </article>
              <article className="pricing highlight">
                <h3>Próximamente Pro</h3>
                <div className="price">Hogar</div>
                <p>Para quienes quieren compartir mejor, planificar objetivos y construir su buen karma financiero en serio.</p>
                <ul className="list">
                  <li>Espacios compartidos</li>
                  <li>Más automatización y seguimiento</li>
                  <li>Funciones pensadas para pareja y familia</li>
                </ul>
                <a className="btn btn-primary" href={APP_URL} target="_blank" rel="noopener noreferrer">Ver la demo</a>
              </article>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container-x">
            <div className="cta-box">
              <div className="eyebrow" style={{ margin: "0 auto 1rem" }}><span className="dot"></span> Karma Financiero</div>
              <h2>Menos tensión. Más claridad.</h2>
              <p>Prueba una forma más tranquila y bonita de llevar las finanzas que compartes. Empieza hoy y convierte el dinero en una conversación más fácil.</p>
              <a className="btn btn-primary" href={APP_URL} target="_blank" rel="noopener noreferrer">Abrir la app</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container-x footer-grid">
          <div>Karma Financiero — Finanzas compartidas con calma.</div>
          <a href={APP_URL} target="_blank" rel="noopener noreferrer">app.karmafinanciero.com</a>
        </div>
      </footer>
    </>
  );
}
