import { Link } from "@tanstack/react-router";
import karmaLogo from "@/assets/karma-logo.svg.asset.json";

const APP_URL = "https://app.karmafinanciero.com/";

export function SiteFooter() {
  return (
    <footer className="site-footer g-footer">
      <div className="container-x g-foot-grid">
        <div className="g-foot-brand">
          <img src={karmaLogo.url} alt="Karma Financiero" className="brand-logo" />
          <p>Finanzas compartidas con calma.</p>
        </div>
        <form className="g-newsletter" onSubmit={(e) => e.preventDefault()}>
          <label>Suscríbete a la newsletter</label>
          <div className="g-news-row">
            <input type="email" placeholder="tu@email.com" aria-label="Email" />
            <button type="submit">Suscribir</button>
          </div>
        </form>
        <nav className="g-foot-links" aria-label="Pies">
          <strong>Páginas</strong>
          <Link to="/" hash="features">Funciones</Link>
          <Link to="/" hash="planes">Planes</Link>
          <Link to="/blog">Blog</Link>
          <a href={APP_URL} target="_blank" rel="noopener noreferrer">Abrir app</a>
        </nav>
        <nav className="g-foot-links" aria-label="Legal">
          <strong>Legal</strong>
          <Link to="/legal/aviso-legal">Aviso legal</Link>
          <Link to="/legal/privacidad">Privacidad</Link>
          <Link to="/legal/cookies">Política de cookies</Link>
        </nav>
      </div>
      <div className="container-x g-foot-bottom">
        <span>© 2026 Karma Financiero</span>
        <a href={APP_URL} target="_blank" rel="noopener noreferrer">app.karmafinanciero.com</a>
      </div>
    </footer>
  );
}
