import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import karmaLogo from "@/assets/karma-logo.svg";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuId = useId();

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

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
        <button
          type="button"
          className="nav-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls={mobileMenuId}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav
          id={mobileMenuId}
          className={`nav-mobile ${menuOpen ? "is-open" : ""}`}
          aria-label="Principal móvil"
          aria-hidden={!menuOpen}
        >
          <Link to="/" hash="features" onClick={closeMenu}>Funciones</Link>
          <Link to="/" hash="planes" onClick={closeMenu}>Planes</Link>
          <Link to="/" hash="planes" onClick={closeMenu}>Precio</Link>
          <Link to="/blog" onClick={closeMenu}>Blog</Link>
          <Link className="nav-mobile-cta" to="/lista-espera" onClick={closeMenu}>
            Probar gratis
          </Link>
        </nav>
      </div>
    </header>
  );
}
