import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

type LeadStatus = "idle" | "sent";

export const Route = createFileRoute("/lista-espera")({
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
      { property: "og:url", content: "https://karmafinanciero.com/lista-espera" },
    ],
    links: [{ rel: "canonical", href: "https://karmafinanciero.com/lista-espera" }],
  }),
  component: LeadCapture,
});

function LeadCapture() {
  const [status, setStatus] = useState<LeadStatus>("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const lead = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      profile: String(data.get("profile") || ""),
      goal: String(data.get("goal") || ""),
      createdAt: new Date().toISOString(),
      source: "lista-espera",
    };

    const current = JSON.parse(localStorage.getItem("karma-leads") || "[]");
    localStorage.setItem("karma-leads", JSON.stringify([lead, ...current]));
    setStatus("sent");
    form.reset();
  }

  return (
    <>
      <SiteHeader />

      <main className="lead-page">
        <section className="container-x lead-hero">
          <div className="lead-copy">
            <span className="eyebrow"><span className="dot" /> Acceso anticipado</span>
            <h1>
              Sé de los primeros en probar <em>Karma Financiero</em>.
            </h1>
            <p>
              Estamos preparando una forma más tranquila de ordenar gastos, objetivos y decisiones
              de dinero compartido. Déjanos tu correo y te avisaremos cuando abramos nuevos accesos.
            </p>
            <div className="lead-points" aria-label="Ventajas">
              <span>Sin tarjeta</span>
              <span>Acceso gradual</span>
              <span>Feedback directo</span>
            </div>
          </div>

          <form className="lead-form" name="karma-leads" onSubmit={handleSubmit}>
            <div className="lead-form-head">
              <strong>Únete a la lista</strong>
              <p>Te escribiremos solo cuando haya novedades útiles.</p>
            </div>

            <label>
              Nombre
              <input name="name" type="text" placeholder="Tu nombre" autoComplete="name" required />
            </label>

            <label>
              Email
              <input name="email" type="email" placeholder="tu@email.com" autoComplete="email" required />
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

            <button className="btn-pill btn-pill-dark lead-submit" type="submit">
              Apuntarme
            </button>

            {status === "sent" && (
              <p className="lead-success" role="status">
                Listo. Te hemos añadido a la lista de interesados.
              </p>
            )}
          </form>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
