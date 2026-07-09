import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

type LeadStatus = "idle" | "submitting" | "sent" | "error";
type LeadSearch = { email?: string };

// Public client credentials for the dedicated Karma waitlist project.
// Keeping these separate prevents Lovable Cloud from routing leads to its legacy database.
const WAITLIST_SUPABASE_URL = "https://vyjcfuhohzmzvuxmbqgv.supabase.co";
const WAITLIST_SUPABASE_KEY = "sb_publishable_4DLru48DNJm89EL3_lDGjA_Prs3Luw-";

export const Route = createFileRoute("/lista-espera")({
  validateSearch: (search: Record<string, unknown>): LeadSearch => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Únete a Karma Financiero — Lista de espera" },
      {
        name: "description",
        content:
          "Déjanos tu correo y te avisaremos cuando Karma Financiero esté listo para tu hogar.",
      },
      { property: "og:title", content: "Únete a Karma Financiero" },
      {
        property: "og:description",
        content:
          "Apúntate para probar la app de finanzas compartidas con calma.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://karmafinanciero.com/lista-espera" },
    ],
    links: [{ rel: "canonical", href: "https://karmafinanciero.com/lista-espera" }],
  }),
  component: LeadCapture,
});

function LeadCapture() {
  const { email } = Route.useSearch();
  const [status, setStatus] = useState<LeadStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("submitting");

    const lead = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      profile: String(data.get("profile") || ""),
      goal: String(data.get("goal") || ""),
      website: String(data.get("website") || ""),
      consent: data.get("consent") === "on",
      source: "lista-espera",
    };

    try {
      const response = await fetch(`${WAITLIST_SUPABASE_URL}/functions/v1/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: WAITLIST_SUPABASE_KEY,
          Authorization: `Bearer ${WAITLIST_SUPABASE_KEY}`,
        },
        body: JSON.stringify(lead),
      });

      if (!response.ok) throw new Error("No se pudo registrar el lead");

      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="lead-page">
        <section className="container-x lead-hero">
          <div className="lead-copy">
            <span className="eyebrow"><span className="dot" /> Acceso anticipado</span>
            <h1>
              Sé de los primeros en probar Karma Financiero.
            </h1>
            <p>
              Estamos preparando una forma más tranquila de ordenar gastos, objetivos y decisiones
              de dinero compartido. Déjanos tu correo y te avisaremos cuando abramos nuevos accesos.
            </p>
            <ul className="lead-points">
              <li>Sin tarjeta</li>
              <li>Acceso gradual</li>
              <li>Feedback directo</li>
            </ul>
          </div>

          <form className="lead-form" name="karma-leads" onSubmit={handleSubmit}>
            <div className="lead-form-head">
              <h2>Únete a la lista</h2>
              <p>Te escribiremos solo cuando haya novedades útiles.</p>
            </div>

            <label>
              Nombre
              <input name="name" type="text" placeholder="Tu nombre" autoComplete="name" required />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                defaultValue={email ?? ""}
                required
              />
            </label>

            <label className="lead-honeypot" aria-hidden="true">
              Tu web
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>

            <label>
              ¿Cómo usarías Karma?
              <select name="profile" defaultValue="" required>
                <option value="" disabled>Elige una opción</option>
                <option value="pareja">Con mi pareja</option>
                <option value="familia">Con mi familia</option>
                <option value="compartido">En un hogar compartido</option>
                <option value="personal">Para organizarme mejor</option>
              </select>
            </label>

            <label>
              ¿Qué te gustaría resolver primero?
              <textarea
                name="goal"
                placeholder="Ej. gastos compartidos, objetivos de ahorro, deudas..."
                rows={4}
              />
            </label>

            <label className="lead-consent">
              <input type="checkbox" name="consent" required />
              <span>Acepto recibir comunicaciones sobre Karma Financiero.</span>
            </label>

            <button
              className="btn-pill btn-pill-dark lead-submit"
              type="submit"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Apuntándote..." : "Apuntarme"}
            </button>

            <div>
              {status === "sent" && (
                <p className="lead-success" role="status">
                  Listo. Ya formas parte de la lista de Karma Financiero.
                </p>
              )}
              {status === "error" && (
                <p className="lead-error" role="alert">
                  No hemos podido completar el registro. Inténtalo de nuevo en un momento.
                </p>
              )}
            </div>
          </form>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
