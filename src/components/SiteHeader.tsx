import { Link } from "@tanstack/react-router";
import karmaLogo from "@/assets/karma-logo.svg.asset.json";

const APP_URL = "https://app.karmafinanciero.com/";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="nav-pill">
        <Link to="/" aria-label="Karma Financiero">
          <img src={karmaLogo.url} alt="Karma Financiero" className="brand-logo" />
        </Link>
        <nav className="nav-links" aria-label="Principal">
          <Link to="/" hash="features">Funciones</Link>
          <Link to="/" hash="planes">Planes</Link>
          <Link to="/blog">Blog</Link>
        </nav>
        <Link className="nav-cta" to="/acceso">
          Probar gratis →
        </Link>
      </div>
    </header>
  );
}
