import { createClient } from "npm:@supabase/supabase-js@2";
import { WAITLIST_LOGO_BASE64 } from "./logo-base64.ts";

const allowedOrigins = new Set([
  "https://karmafinanciero.com",
  "https://www.karmafinanciero.com",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
]);

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "";
  const isLovablePreview = /^https:\/\/[a-z0-9-]+\.(lovableproject\.com|lovable\.app)$/i.test(origin);
  const allowedOrigin = allowedOrigins.has(origin) || isLovablePreview;
  return {
    "Access-Control-Allow-Origin": allowedOrigin
      ? origin
      : "https://karmafinanciero.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), "Content-Type": "application/json" },
  });
}

function welcomeEmail(name: string, unsubscribeUrl: string) {
  const greeting = name ? `Hola, ${name}.` : "Hola.";

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#F5F5F0;color:#222222;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F5F5F0;">
      <tr><td align="center" style="padding:48px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
          <tr><td align="center" style="padding-bottom:32px;"><img src="cid:karma-logo" alt="Karma Financiero" width="260" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;max-width:100%;height:auto;"></td></tr>
          <tr><td align="center" style="font-size:16px;line-height:1.6;padding:0 12px;">
            <p style="margin:0 0 18px;"><strong>${greeting} Gracias por apuntarte.</strong></p>
            <p style="margin:0 0 18px;">Karma Financiero es un espacio para ordenar ingresos, gastos y objetivos compartidos sin excels imposibles ni conversaciones que empiezan con «solo ha sido una compra pequeña».</p>
            <p style="margin:0 0 24px;">Te avisaremos cuando abramos nuevos accesos para que puedas cuidar la economía de tu hogar con un poco más de claridad y bastante menos drama.</p>
          </td></tr>
          <tr><td align="center" style="padding:0 12px 24px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" style="background:#E8E87A;border-radius:16px;font-size:15px;line-height:1.55;padding:16px 20px;">No sabemos si el 90% de las parejas discute por dinero; sí sabemos que nadie debería necesitar una cumbre diplomática para repartir el alquiler.</td></tr></table>
          </td></tr>
          <tr><td align="center" style="font-size:12px;line-height:1.5;color:#888888;padding:0 24px;">Has recibido este correo porque te apuntaste a la lista de espera de Karma Financiero.<br><a href="${unsubscribeUrl}" style="color:#777777;text-decoration:underline;">Salir de la lista</a></td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(request) });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json(request, { error: "Falta configuración del servidor" }, 500);
  }

  if (request.method === "GET") {
    const token = new URL(request.url).searchParams.get("unsubscribe") || "";
    const validToken = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token);
    if (!validToken) return json(request, { error: "Enlace no válido" }, 400);

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await supabase
      .from("waitlist_leads")
      .update({ consent: false, unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token);

    if (error) return json(request, { error: "No se pudo completar la baja" }, 500);

    return new Response(`<!doctype html><html lang="es"><body style="margin:0;background:#F5F5F0;font-family:Arial,sans-serif;color:#222;"><table role="presentation" width="100%" height="100%"><tr><td align="center" style="padding:64px 20px;"><h1 style="font-family:Georgia,serif;font-weight:400;">Te has dado de baja</h1><p>Ya no recibirás novedades de la lista de espera de Karma Financiero.</p></td></tr></table></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  if (request.method !== "POST") return json(request, { error: "Method not allowed" }, 405);

  try {
    const payload = await request.json();
    const name = String(payload.name || "").trim().slice(0, 100);
    const email = String(payload.email || "").trim().toLowerCase().slice(0, 254);
    const profile = String(payload.profile || "");
    const goal = String(payload.goal || "").trim().slice(0, 1000);
    const source = String(payload.source || "lista-espera").slice(0, 80);
    const website = String(payload.website || "");
    const consent = payload.consent === true;
    const validProfiles = new Set(["pareja", "familia", "compartido", "personal"]);
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Bots tend to fill this hidden field. Return success without storing anything.
    if (website) return json(request, { ok: true });

    if (!name || !validEmail || !validProfiles.has(profile) || !consent) {
      return json(request, { error: "Datos no válidos" }, 400);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("WAITLIST_FROM_EMAIL") ||
      "Karma Financiero <hola@karmafinanciero.com>";

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: lead, error: insertError } = await supabase
      .from("waitlist_leads")
      .insert({
        name,
        email,
        profile,
        goal: goal || null,
        consent,
        consent_at: new Date().toISOString(),
        source,
      })
      .select("id, unsubscribe_token")
      .single();

    if (insertError?.code === "23505") {
      return json(request, { ok: true, alreadyRegistered: true });
    }
    if (insertError) throw insertError;

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY no configurada; lead guardado sin email de bienvenida");
      return json(request, { ok: true, emailSent: false });
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `waitlist-welcome-${lead.id}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: "Ya estás en la lista de Karma Financiero",
        html: welcomeEmail(
          name,
          `${new URL(request.url).origin}/functions/v1/waitlist?unsubscribe=${lead.unsubscribe_token}`,
        ),
        attachments: [
          {
            content: WAITLIST_LOGO_BASE64,
            filename: "karma-financiero.png",
            content_id: "karma-logo",
            content_type: "image/png",
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      console.error("Resend error", await emailResponse.text());
      return json(request, { ok: true, emailSent: false });
    }

    await supabase
      .from("waitlist_leads")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("id", lead.id);

    return json(request, { ok: true, emailSent: true });
  } catch (error) {
    console.error(error);
    return json(request, { error: "No se pudo completar el registro" }, 500);
  }
});
