"use client";

import { useEffect, useMemo, useState } from "react";
import {
  YPF_MENU_SECTIONS,
  PROMOS,
  type MenuSection,
  type PromoItem,
} from "@/lib/constants";

/* ------------ utils ------------ */
function driveImage(url: string) {
  const id =
    url.match(/\/d\/([^/]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/[?&]fileId=([^&]+)/)?.[1];
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : url;
}

/* -------- Bloqueo “amistoso” en landscape -------- */
function OrientationOverlay() {
  const [landscape, setLandscape] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)");
    const onChange = () => setLandscape(mq.matches && window.innerWidth <= 1024);
    onChange();
    mq.addEventListener?.("change", onChange);
    window.addEventListener("resize", onChange);
    return () => {
      mq.removeEventListener?.("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);
  if (!landscape) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-[#0033A0] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="text-2xl font-bold mb-2">Girá el teléfono</div>
      <p className="opacity-90">Este menú está optimizado para vertical.</p>
    </div>
  );
}

/* ---------------- Carrusel promos (solo imágenes) ---------------- */
function PromoCarousel({ items, intervalMs = 5000 }: { items: PromoItem[]; intervalMs?: number }) {
  const images = useMemo(
    () => items.filter(Boolean).map((it) => ({ ...it, src: driveImage(it.mediaUrl) })),
    [items]
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), intervalMs);
    return () => clearInterval(t);
  }, [images.length, intervalMs]);

  const go = (i: number) => setIndex((i + images.length) % images.length);
  if (!images.length) return null;

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4">
      <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((item) => (
            <div key={item.id} className="min-w-full relative">
              <div className="w-full aspect-[16/9] bg-black">
                <img
                  src={item.src}
                  alt={item.title ?? "Promo"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              {(item.title || item.subtitle || (item.ctaText && item.ctaHref)) && (
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="max-w-xl rounded-xl bg-black/55 text-white p-3">
                    {item.title && <h3 className="text-lg font-semibold leading-tight">{item.title}</h3>}
                    {item.subtitle && <p className="text-sm opacity-90 mt-1">{item.subtitle}</p>}
                    {item.ctaText && item.ctaHref && (
                      <a
                        href={item.ctaHref}
                        className="inline-block mt-3 rounded-xl px-4 py-2 bg-yellow-400 text-gray-900 font-semibold hover:brightness-105"
                      >
                        {item.ctaText}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* dots */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2.5 bg-white/60"
              }`}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Lista simple por sección ---------------- */
function Section({ section }: { section: MenuSection }) {
  return (
    <section id={section.id} className="max-w-3xl mx-auto px-4 py-8 scroll-mt-20">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">{section.title}</h2>
      <ul className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 divide-y divide-neutral-200">
        {section.items.map((it, i) => (
          <li key={i} className="flex items-start justify-between gap-4 p-4">
            <div>
              <p className="font-medium leading-tight">{it.name}</p>
              {it.desc && <p className="text-sm text-neutral-500">{it.desc}</p>}
            </div>
            <span className="font-semibold tabular-nums whitespace-nowrap">{it.price}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------- Pósters múltiples + lista en bloques (3/3/3...) ------------- */
function MenuSectionPosterMulti({
  section,
  posterSrcs,
  chunkSize = 3,
  posterAlt = section.title,
}: {
  section: MenuSection;
  posterSrcs: string[];
  chunkSize?: number;
  posterAlt?: string;
}) {
  const chunks: typeof section.items[] = [];
  for (let i = 0; i < section.items.length; i += chunkSize) {
    chunks.push(section.items.slice(i, i + chunkSize));
  }

  return (
    <section id={section.id} className="scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">{section.title}</h2>

        {chunks.map((itemsChunk, idx) => (
          <div key={idx} className="mb-7 last:mb-0">
            {posterSrcs[idx] && (
              <div className="rounded-2xl overflow-hidden ring-1 ring-black/10 shadow-sm bg-white">
                <img
                  src={posterSrcs[idx]}
                  alt={posterAlt}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {!!itemsChunk.length && (
              <ul className="mt-5 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 divide-y divide-neutral-200">
                {itemsChunk.map((it, i) => (
                  <li key={i} className="flex items-start justify-between gap-4 p-4">
                    <div>
                      <p className="font-medium leading-tight">{it.name}</p>
                      {it.desc && <p className="text-sm text-neutral-500">{it.desc}</p>}
                    </div>
                    <span className="font-semibold tabular-nums whitespace-nowrap">{it.price}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* =================== Página =================== */
export default function YpfMenuPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = useMemo(() => YPF_MENU_SECTIONS.map((s) => ({ id: s.id, label: s.title })), []);

  // Config de posters por sección (agregá/quité imágenes según necesites)
  const POSTERS: Record<string, { posterSrcs: string[]; chunkSize?: number }> = {
    cafeteria: { posterSrcs: ["/listadocafeteria.png"], chunkSize: 6 },
    comidas: { posterSrcs: ["/listadocomida.png"], chunkSize: 20 },
    panaderia: { posterSrcs: ["/listadopanaderia.png"], chunkSize: 8 },
    hamburguesas: {
      posterSrcs: ["/comboshamburguesas.png", "/comboshamburguesas2.png", "/comboshamburguesas3.png"],
      chunkSize: 3,
    },
    hamburguesapollo: {
      posterSrcs: ["/comboshamburguesas4.png"],
      chunkSize: 6,
    },
    ensaladas: {
      posterSrcs: ["/ensaladas.png"],
      chunkSize: 6,
    },
  };

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <OrientationOverlay />

      {/* Header FIJO (no sticky). El layout ya deja el espacio arriba. */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-[#0033A0] text-white shadow"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold">YPF • Menú</h1>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir secciones"
            className="rounded-lg px-3 py-2 bg-white/10 hover:bg-white/20 active:bg-white/25"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Backdrop + sheet con transición */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          menuOpen ? "opacity-100 bg-black/40" : "pointer-events-none opacity-0 bg-black/0"
        }`}
        onClick={() => setMenuOpen(false)}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-2xl pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ${
          menuOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        <div className="mx-auto max-w-5xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Secciones</h2>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar"
              className="rounded-lg px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200"
            >
              Cerrar
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => scrollTo(t.id)}
                className="rounded-xl border border-neutral-200 px-3 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100 text-left"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <section className="py-4">
        <PromoCarousel items={PROMOS} intervalMs={5000} />
      </section>

      {YPF_MENU_SECTIONS.map((section) => {
        const cfg = POSTERS[section.id];
        return cfg ? (
          <MenuSectionPosterMulti
            key={section.id}
            section={section}
            posterSrcs={cfg.posterSrcs}
            chunkSize={cfg.chunkSize ?? 3}
          />
        ) : (
          <Section key={section.id} section={section} />
        );
      })}

      <footer className="max-w-5xl mx-auto px-4 py-8 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Grupo GEN – Estaciones YPF
      </footer>
    </>
  );
}
