import { createFileRoute } from "@tanstack/react-router";
import { LegalPageView } from "@/components/legal/LegalPageView";
import { FALLBACK_LEGAL_PAGES, fetchLegalPage } from "@/lib/legal-cms";
import { buildSeoHead, fetchSeoPage } from "@/lib/seo-cms";

const slug = "accesibilidad";

export const Route = createFileRoute("/legal/accesibilidad")({
  loader: async () => {
    const [page, seo] = await Promise.all([fetchLegalPage(slug), fetchSeoPage(`/legal/${slug}`)]);
    return { page, seo };
  },
  headers: () => ({
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "CDN-Cache-Control": "no-store",
  }),
  head: ({ loaderData }) => {
    const page = loaderData?.page ?? FALLBACK_LEGAL_PAGES[slug];
    return buildSeoHead({
      seo: loaderData?.seo,
      defaults: {
        path: `/legal/${slug}`,
        title: page.seo_title || page.title,
        description: page.seo_description || page.intro,
        image: "/head-icon.png",
      },
    });
  },
  component: AccessibilityPage,
});

function AccessibilityPage() {
  return <LegalPageView initialPage={Route.useLoaderData().page ?? FALLBACK_LEGAL_PAGES[slug]} />;
}
