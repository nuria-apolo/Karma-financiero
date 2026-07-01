import { Link } from "@tanstack/react-router";
import karmaLogo from "@/assets/karma-logo.svg";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="nav-pill">
        <Link to="/" aria-label="Karma Financiero">
          <img src={karmaLogo} alt="Karma Financiero" className="brand-logo" />
        </Link>
        <nav className="nav-links" aria-label="Principal">
          <Link to="/" hash="features">Funciones</Link>
          <Link to="/" hash="planes">Planes</Link>
          <Link to="/" hash="planes">Precio</Link>
          <Link to="/blog">Blog</Link>
        </nav>
        <Link className="nav-cta" to="/lista-espera">
          Probar gratis
        </Link>
      </div>
    </header>
  );
}
