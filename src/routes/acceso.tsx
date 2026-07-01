import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

const APP_URL = "https://app.karmafinanciero.com/";

export const Route = createFileRoute("/acceso")({
  head: () => ({
    meta: [
      { title: "Acceso anticipado — Karma Financiero" },
      {
        name: "description",
        content:
          "Apúntate a la lista de acceso anticipado a Karma Financiero y sé de los primeros en probar una forma más tranquila de organizar las finanzas compartidas.",
      },
      { property: "og:title", content: "Acceso anticipado — Karma Financiero" },
      {
        property: "og:description",
        content: "Únete a la lista y prueba Karma Financiero antes que nadie.",
      },
      { property: "og:url", content: "https://karmafinanciero.com/acceso" },
    ],
    links: [{ rel: "canonical", href: "https://karmafinanciero.com/acceso" }],
  }),
  component: AccesoPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Cuéntanos tu nombre").max(100),
  email: z.string().trim().email("Email no válido").max(255),
  use_case: z.string().max(100).optional(),
  first_task: z.string().trim().max(1000).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Necesitamos tu consentimiento" }) }),
});

const USE_CASES = [
  "En pareja",
  "En familia",
  "Con compañeros de piso",
  "Uso personal",
  "Aún no lo tengo claro",
];

function AccesoPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      use_case: String(fd.get("use_case") || "") || undefined,
      first_task: String(fd.get("first_task") || "") || undefined,
      consent: fd.get("consent") === "on",
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa el formulario");
      return;
    }
    setStatus("loading");
    const { error: dbError } = await supabase.from("leads").insert({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      use_case: parsed.data.use_case ?? null,
      first_task: parsed.data.first_task ?? null,
      consent: parsed.data.consent,
      source: "acceso-anticipado",
    });
    if (dbError && dbError.code !== "23505") {
      setStatus("error");
      setError("No hemos podido guardar tu correo. Prueba de nuevo en unos segundos.");
      return;
    }
    setStatus("success");
    // Redirigir a la app pasados 900ms para que se vea la confirmación
    setTimeout(() => {
      window.location.href = APP_URL;
    }, 900);
  }

  return (
    <>
      <SiteHeader />
      <main className="acceso-main">
        <section className="acceso-wrap container-x">
          <div className="acceso-copy">
            <span className="acceso-tag">
              <span className="dot" /> Acceso anticipado
            </span>
            <h1>
              Sé de los primeros en <br />
              probar <em>Karma Financiero.</em>
            </h1>
            <p>
              Estamos preparando una forma más tranquila de ordenar gastos, objetivos y decisiones
              de dinero compartido. Déjanos tu correo y te avisaremos cuando abramos nuevos
              accesos.
            </p>
            <ul className="acceso-chips">
              <li>Sin tarjeta</li>
              <li>Acceso gradual</li>
              <li>Feedback directo</li>
            </ul>
          </div>

          <form className="acceso-card" onSubmit={onSubmit} noValidate>
            <h2>Únete a la lista</h2>
            <p className="acceso-sub">Te escribiremos solo cuando haya novedades útiles.</p>

            <label className="acceso-label" htmlFor="name">Nombre</label>
            <input id="name" name="name" type="text" placeholder="Tu nombre" required maxLength={100} />

            <label className="acceso-label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="tu@email.com" required maxLength={255} />

            <label className="acceso-label" htmlFor="use_case">¿Cómo usarías Karma?</label>
            <select id="use_case" name="use_case" defaultValue="">
              <option value="" disabled>Elige una opción</option>
              {USE_CASES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>

            <label className="acceso-label" htmlFor="first_task">¿Qué te gustaría resolver primero?</label>
            <textarea
              id="first_task"
              name="first_task"
              rows={3}
              maxLength={1000}
              placeholder="Ej. gastos compartidos, objetivos de ahorro, deudas..."
            />

            <label className="acceso-check">
              <input type="checkbox" name="consent" required />
              <span>Acepto recibir comunicaciones sobre Karma Financiero.</span>
            </label>

            {error && <p className="acceso-error" role="alert">{error}</p>}
            {status === "success" && (
              <p className="acceso-ok" role="status">
                ¡Listo! Te llevamos a la app…
              </p>
            )}

            <button type="submit" className="acceso-cta" disabled={status === "loading"}>
              {status === "loading" ? "Enviando…" : "Apuntarme"}
            </button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
