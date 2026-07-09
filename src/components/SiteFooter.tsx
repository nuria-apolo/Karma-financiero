import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import karmaLogo from "@/assets/karma-logo.svg";

export function SiteFooter() {
  return (
    <footer className="site-footer g-footer">
      <div className="g-footer-shell">
        <div className="g-foot-grid">
          <div className="g-foot-brand">
            <img src={karmaLogo} alt="Karma Financiero" className="brand-logo" />
            <p>Finanzas compartidas con calma.</p>
            <nav className="g-foot-socials" aria-label="Redes sociales">
              <a
                href="https://www.instagram.com/karmafinanciero/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Karma Financiero en Instagram"
                title="Instagram"
              >
                <Instagram aria-hidden="true" />
              </a>
              <a
                href="https://www.linkedin.com/company/karma-financiero/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Karma Financiero en LinkedIn"
                title="LinkedIn"
              >
                <Linkedin aria-hidden="true" />
              </a>
              <a
                href="https://www.facebook.com/people/Karma-Financiero/61591767630840/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Karma Financiero en Facebook"
                title="Facebook"
              >
                <Facebook aria-hidden="true" />
              </a>
            </nav>
          </div>
          <form className="g-newsletter" action="/lista-espera" method="get">
            <label htmlFor="footer-newsletter-email">Suscríbete a la newsletter</label>
            <div className="g-news-row">
              <input
                id="footer-newsletter-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="tu@email.com"
                required
              />
              <button type="submit">Suscribir</button>
            </div>
          </form>
          <nav className="g-foot-links" aria-label="Páginas">
            <strong>Páginas</strong>
            <Link to="/" hash="features">Funciones</Link>
            <Link to="/" hash="planes">Planes</Link>
            <Link to="/" hash="planes">Precio</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/lista-espera">Lista de espera</Link>
          </nav>
          <nav className="g-foot-links" aria-label="Legal">
            <strong>Legal</strong>
            <Link to="/legal/aviso-legal">Aviso legal</Link>
            <Link to="/legal/privacidad">Privacidad</Link>
            <Link to="/legal/cookies">Política de cookies</Link>
            <Link to="/legal/accesibilidad">Accesibilidad</Link>
          </nav>
        </div>
        <div className="g-foot-bottom">
          <span>Un producto de Karma Financiero · 2026</span>
          <Link to="/lista-espera">Acceso anticipado</Link>
        </div>
      </div>
    </footer>
  );
}
