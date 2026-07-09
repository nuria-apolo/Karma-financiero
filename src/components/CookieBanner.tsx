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
    const granted = value === "accepted" ? "granted" : "denied";
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === "function") {
      w.gtag("consent", "update", {
        ad_storage: granted,
        ad_user_data: granted,
        ad_personalization: granted,
        analytics_storage: granted,
      });
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="cookie-banner" aria-labelledby="cookie-banner-title">
      <div className="cookie-banner-inner">
        <h2 id="cookie-banner-title" className="sr-only">Preferencias de cookies</h2>
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
    </aside>
  );
}
