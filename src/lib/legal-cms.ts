import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type LegalPageRow = Tables<"legal_pages">;
export type LegalPageUpdate = TablesUpdate<"legal_pages">;

const fallbackTimestamp = "2026-07-08T00:00:00.000Z";

export const FALLBACK_LEGAL_PAGES: Record<string, LegalPageRow> = {
  "aviso-legal": {
    id: "fallback-aviso-legal",
    title: "Aviso legal",
    slug: "aviso-legal",
    eyebrow: "Información legal",
    intro:
      "Información sobre la titularidad, las condiciones de uso y las responsabilidades aplicables al sitio web de Karma Financiero.",
    content: `## 1. Titular del sitio

Este sitio web está gestionado por **Karma Financiero**. Para cualquier comunicación puedes escribirnos a hola@karmafinanciero.com.

## 2. Objeto

El presente aviso legal regula el uso del sitio. La navegación atribuye la condición de usuario e implica la aceptación de las disposiciones aquí incluidas.

## 3. Propiedad intelectual e industrial

Todos los contenidos del sitio son titularidad de Karma Financiero o de terceros que han autorizado su uso. Queda prohibida su reproducción total o parcial sin autorización expresa.

## 4. Responsabilidad

Karma Financiero no se hace responsable de los daños derivados del uso indebido del sitio ni de la indisponibilidad temporal del servicio por causas técnicas o de fuerza mayor.

## 5. Legislación y jurisdicción

Las presentes condiciones se rigen por la legislación española.`,
    seo_title: "Aviso legal — Karma Financiero",
    seo_description: "Información legal del sitio web de Karma Financiero.",
    created_at: fallbackTimestamp,
    updated_at: fallbackTimestamp,
  },
  privacidad: {
    id: "fallback-privacidad",
    title: "Política de privacidad",
    slug: "privacidad",
    eyebrow: "Privacidad y datos",
    intro:
      "Te explicamos de forma clara qué datos tratamos, para qué los utilizamos y cómo puedes ejercer tus derechos.",
    content: `## 1. Responsable del tratamiento

El responsable del tratamiento de tus datos es **Karma Financiero**. Contacto: hola@karmafinanciero.com.

## 2. Datos que tratamos

Tratamos los datos que nos facilitas voluntariamente al darte de alta, suscribirte o contactarnos.

## 3. Finalidades

- Prestar y mantener el servicio.
- Enviar comunicaciones cuando lo autorices.
- Atender consultas, soporte y obligaciones legales.

## 4. Derechos

Puedes ejercer tus derechos escribiendo a hola@karmafinanciero.com.`,
    seo_title: "Política de privacidad — Karma Financiero",
    seo_description: "Cómo trata Karma Financiero los datos personales.",
    created_at: fallbackTimestamp,
    updated_at: fallbackTimestamp,
  },
  cookies: {
    id: "fallback-cookies",
    title: "Política de cookies",
    slug: "cookies",
    eyebrow: "Preferencias y cookies",
    intro:
      "Conoce qué cookies utiliza Karma Financiero, para qué sirven y cómo puedes cambiar tus preferencias.",
    content: `## 1. ¿Qué son las cookies?

Las cookies son pequeños archivos que un sitio web almacena en tu dispositivo para recordar información sobre tu visita.

## 2. Cookies que utilizamos

- **Técnicas:** necesarias para que el sitio funcione.
- **Analíticas:** nos ayudan a mejorar y solo se activan si las aceptas.

## 3. Gestión del consentimiento

Puedes cambiar tu decisión en cualquier momento desde esta página.`,
    seo_title: "Política de cookies — Karma Financiero",
    seo_description: "Qué cookies usa Karma Financiero y cómo configurarlas.",
    created_at: fallbackTimestamp,
    updated_at: fallbackTimestamp,
  },
  accesibilidad: {
    id: "fallback-accesibilidad",
    title: "Declaración de accesibilidad",
    slug: "accesibilidad",
    eyebrow: "Compromiso accesible",
    intro:
      "En Karma Financiero queremos que ordenar la economía del hogar sea fácil para todas las personas, con independencia de sus capacidades, tecnología o contexto de uso.",
    content: `## 1. Situación de cumplimiento

Este sitio web es **parcialmente conforme** con WCAG 2.1 nivel AA.

- Navegación por teclado y foco visible.
- Contraste legible.
- Texto ampliable.
- Diseño adaptable.

## 2. Comunicación y contacto

Si encuentras una barrera, escríbenos a hola@karmafinanciero.com.

## 3. Preparación y actualización

Esta declaración se revisará cuando haya cambios relevantes y de forma periódica.`,
    seo_title: "Declaración de accesibilidad — Karma Financiero",
    seo_description: "Compromiso de accesibilidad de Karma Financiero.",
    created_at: fallbackTimestamp,
    updated_at: fallbackTimestamp,
  },
};

export async function fetchLegalPage(slug: string) {
  try {
    const { data, error } = await supabase
      .from("legal_pages")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    return data ?? FALLBACK_LEGAL_PAGES[slug] ?? null;
  } catch (error) {
    console.error(`[legal] Could not load ${slug} from Supabase`, error);
    return FALLBACK_LEGAL_PAGES[slug] ?? null;
  }
}

export function formatLegalDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
