import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "karma-cookies-consent-v1";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (value: "accepted" | "rejected") => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* no-op */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Aviso de cookies">
      <div className="cookie-banner-inner">
        <p>
          Usamos cookies propias y de terceros para mejorar tu experiencia y analizar el uso del
          sitio. Puedes aceptarlas, rechazarlas o leer más en nuestra{" "}
          <Link to="/legal/cookies">Política de cookies</Link>.
        </p>
        <div className="cookie-banner-actions">
          <button type="button" className="btn-pill btn-pill-ghost" onClick={() => save("rejected")}>
            Rechazar
          </button>
          <button type="button" className="btn-pill btn-pill-dark" onClick={() => save("accepted")}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
