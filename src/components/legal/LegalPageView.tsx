import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  FileText,
  Globe2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BlogContent } from "@/components/blog/BlogContent";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  fetchLegalPage,
  formatLegalDate,
  type LegalPageRow,
} from "@/lib/legal-cms";

type LegalPageViewProps = {
  initialPage: LegalPageRow;
  showCookiePreferences?: boolean;
};

function splitLegalSections(content: string) {
  return content
    .split(/\n(?=## )/)
    .map((section) => section.trim())
    .filter(Boolean);
}

export function LegalPageView({
  initialPage,
  showCookiePreferences = false,
}: LegalPageViewProps) {
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    let active = true;
    void fetchLegalPage(initialPage.slug).then((nextPage) => {
      if (active && nextPage) setPage(nextPage);
    });
    return () => {
      active = false;
    };
  }, [initialPage.slug]);

  const resetCookies = () => {
    window.localStorage.removeItem("karma-cookies-consent-v1");
    window.location.reload();
  };

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="accessibility-page legal-cms-page">
        <header className="accessibility-hero">
          <div className="container-x accessibility-hero-inner">
            <span className="accessibility-kicker">
              <Check aria-hidden="true" size={15} strokeWidth={2.5} />
              {page.eyebrow}
            </span>
            <h1>{page.title}</h1>
            <div className="accessibility-meta" aria-label="Información de la página">
              <span>
                <CalendarDays aria-hidden="true" size={17} />
                Actualizada el {formatLegalDate(page.updated_at)}
              </span>
              <span>
                <Globe2 aria-hidden="true" size={17} />
                Karma Financiero
              </span>
            </div>
          </div>
        </header>

        <div className="container-x accessibility-content">
          <Link to="/" className="accessibility-back">
            <ArrowLeft aria-hidden="true" size={17} /> Volver a inicio
          </Link>

          <div className="accessibility-intro">
            <p>{page.intro}</p>
          </div>

          <div className="legal-cms-sections">
            {splitLegalSections(page.content).map((section, index) => (
              <section className="accessibility-section" key={`${page.slug}-${index}`}>
                <span className="legal-section-icon" aria-hidden="true">
                  <FileText />
                </span>
                <div className="legal-section-copy">
                  <BlogContent content={section} />
                </div>
              </section>
            ))}
          </div>

          {showCookiePreferences && (
            <aside className="accessibility-note accessibility-note-contact legal-cookie-preferences">
              <RefreshCw aria-hidden="true" size={20} />
              <div>
                <strong>Preferencias de cookies</strong>
                <span>Puedes revisar tu decisión cuando quieras.</span>
              </div>
              <button type="button" className="btn-pill btn-pill-dark" onClick={resetCookies}>
                Reabrir preferencias
              </button>
            </aside>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
