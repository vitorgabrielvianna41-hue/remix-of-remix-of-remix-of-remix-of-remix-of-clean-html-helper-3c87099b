import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import landingHtml from "../../public/mapa.html?raw";
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";

const IMG = (n: string) => `/assets/${n}.webp`;

const kitMockup = { url: IMG("kit-mockup") };
const [mapa1, mapa2, mapa3, mapa4, mapa5, mapa6] = [1, 2, 3, 4, 5, 6].map((n) => ({
  url: IMG(`mapa-${n}`),
}));
const [depoimento1, depoimento2, depoimento3, depoimento4] = [1, 2, 3, 4].map((n) => ({
  url: IMG(`depoimento-${n}`),
}));
const [bonus1, bonus2, bonus3, bonus4, bonus5] = [1, 2, 3, 4, 5].map((n) => ({
  url: IMG(`bonus-${n}`),
}));
const [avatar1, avatar2, avatar3, avatar4, avatar5] = [1, 2, 3, 4, 5].map((n) => ({
  url: IMG(`avatar-${n}`),
}));

const mapas = [mapa1, mapa2, mapa3, mapa4, mapa5, mapa6].map((a) => a!.url);
const bonusImgs = [bonus1, bonus2, bonus3, bonus4, bonus5].map((a) => a.url);
const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5].map((a) => a.url);

// Cada depoimento tem sua própria foto de produto e seu próprio avatar,
// pareados para que a foto combine com o que a pessoa fala.
const depoimentos: Record<string, { produto: string; avatar: string }> = {
  mariana: { produto: depoimento4.url, avatar: avatars[0]! },
  camila: { produto: depoimento2.url, avatar: avatars[1]! },
  beatriz: { produto: depoimento1.url, avatar: avatars[2]! },
  patricia: { produto: depoimento3.url, avatar: avatars[3]! },
};

const slides = [
  { src: mapa1.url, alt: "Mapa mental de Anatomia Humana — crânio e ossos da face" },
  { src: mapa2.url, alt: "Mapa mental de Fisiologia Humana" },
  { src: mapa3.url, alt: "Mapa mental de Histologia" },
  { src: mapa4.url, alt: "Mapa mental de Microbiologia" },
  { src: mapa5.url, alt: "Mapa mental de Farmacologia" },
  { src: mapa6.url, alt: "Mapa mental de Cariologia" },
];

function rewriteAssets(html: string) {
  return html
    .replace(/\/assets\/kit_mockup_v2\.webp/g, kitMockup.url)
    .replace(/\/assets\/mapa_preview_(\d)\.webp/g, (_m, n) => mapas[(Number(n) - 1) % mapas.length]!)
    .replace(/\/assets\/bonus_(\d)\.webp/g, (_m, n) => bonusImgs[(Number(n) - 1) % bonusImgs.length]!)
    .replace(
      /\/assets\/depoimento_(\w+)_produto\.webp/g,
      (_m, name: string) => depoimentos[name]?.produto ?? depoimento1.url,
    )
    .replace(
      /\/assets\/depoimento_(\w+)_avatar\.webp/g,
      (_m, name: string) => depoimentos[name]?.avatar ?? avatars[0]!,
    )
    .replace(
      /\/assets\/hero_avatar_(\d)\.webp/g,
      (_m, idx: string) => avatars[(Number(idx) - 1) % avatars.length]!,
    );
}


const rawBody = (landingHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? "")
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .trim();

// The dark "preview" section is replaced by the React coverflow carousel.
const previewSection = /<section class="section section--dark">[\s\S]*?<\/section>/i;
const match = rawBody.match(previewSection);
const splitIndex = match ? (match.index ?? 0) : rawBody.length;

const beforeHtml = rewriteAssets(rawBody.slice(0, splitIndex));
const afterHtml = rewriteAssets(rawBody.slice(splitIndex + (match?.[0].length ?? 0)));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kit de Odontologia Visual — +300 Mapas Mentais Imprimíveis" },
      {
        name: "description",
        content:
          "Estude odontologia de forma visual com mais de 300 mapas mentais imprimíveis. Da anatomia à clínica, revise rápido para provas e atendimento.",
      },
      { property: "og:title", content: "Kit de Odontologia Visual — +300 Mapas Mentais" },
      {
        property: "og:description",
        content:
          "Mais de 300 mapas mentais ilustrados de odontologia: anatomia, dentística, endodontia, periodontia, prótese e cirurgia. Acesso vitalício.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: "/style.css" },
    ],
  }),
  component: Index,
});

function useLandingScript() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    let cleanup: (() => void) | undefined;

    const run = () => {
      const init = (window as unknown as { initLanding?: (r: ParentNode) => (() => void) | void })
        .initLanding;
      if (init) cleanup = init(document) || undefined;
    };

    (window as unknown as { __LANDING_MANUAL_INIT__?: boolean }).__LANDING_MANUAL_INIT__ = true;

    if ((window as unknown as { initLanding?: unknown }).initLanding) {
      run();
    } else {
      const script = document.createElement("script");
      script.src = "/script.js";
      script.onload = run;
      document.body.appendChild(script);
    }

    return () => cleanup?.();
  }, []);

  return containerRef;
}

function Index() {
  const containerRef = useLandingScript();

  return (
    <div ref={containerRef}>
      <div dangerouslySetInnerHTML={{ __html: beforeHtml }} />

      <section className="section section--dark">
        <div className="container">
          <span className="section-label">O Material por Dentro</span>
          <h2 className="section-title" style={{ color: "#ffffff" }}>
            Veja como o material é por dentro
          </h2>
          <p className="section-subtitle">
            Mapas ilustrados e organizados por disciplina para facilitar seus estudos e revisões
            rápidas. Arraste para explorar.
          </p>

          <CoverflowCarousel
            slides={slides}
            showNavigation
            showPagination
            className="text-white"
            cardClassName="bg-white aspect-[4/3]"
            label="Prévia dos mapas mentais"
          />

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <a href="#value-stack-section" className="btn-cta">
              Quero Garantir Agora
            </a>
          </div>
        </div>
      </section>

      <div dangerouslySetInnerHTML={{ __html: afterHtml }} />
    </div>
  );
}
