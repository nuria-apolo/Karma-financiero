import { createFileRoute } from "@tanstack/react-router";
import { LegalPageView } from "@/components/legal/LegalPageView";
import { FALLBACK_LEGAL_PAGES, fetchLegalPage } from "@/lib/legal-cms";

const slug = "accesibilidad";

export const Route = createFileRoute("/legal/accesibilidad")({
  loader: () => fetchLegalPage(slug),
  headers: () => ({
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "CDN-Cache-Control": "no-store",
  }),
  head: ({ loaderData }) => {
    const page = loaderData ?? FALLBACK_LEGAL_PAGES[slug];
    return {
      meta: [
        { title: page.seo_title || page.title },
        { name: "description", content: page.seo_description || page.intro },
        { property: "og:title", content: page.seo_title || page.title },
        { property: "og:description", content: page.seo_description || page.intro },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://karmafinanciero.com/legal/accesibilidad" },
      ],
      links: [{ rel: "canonical", href: "https://karmafinanciero.com/legal/accesibilidad" }],
    };
  },
  component: AccessibilityPage,
});

function AccessibilityPage() {
  return <LegalPageView initialPage={Route.useLoaderData() ?? FALLBACK_LEGAL_PAGES[slug]} />;
}
