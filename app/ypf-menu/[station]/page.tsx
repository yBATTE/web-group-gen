"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DEFAULT_MENU, PROMOS } from "@/lib/menu-data";
import type { MenuSection } from "@/lib/menu-types";
import type { PromoItem } from "@/lib/menu-data";
import { STATIONS, type StationSlug } from "@/lib/stations";

/* ------------ utils ------------ */
const nf = new Intl.NumberFormat("es-AR");
const MENU_CACHE_KEY = "menu-cache-v1";
const STATION_KEY = "station-slug";

/** Formatea precio seguro. Soporta "14900" o "14900/15700". */
function formatPriceSafe(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (raw.includes("/")) {
    const parts = raw.split("/").map((p) => p.replace(/[^\d]/g, ""));
    const valids = parts.filter((p) => p.length > 0);
    if (!valids.length) return "";
    return "$ " + valids.map((p) => nf.format(Number(p))).join(" / ");
  }
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  return "$ " + nf.format(Number(digits));
}

function driveImage(url: string) {
  const id =
    url.match(/\/d\/([^/]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/[?&]fileId=([^&]+)/)?.[1];
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : url;
}

const cleanId = (raw: string) =>
  String(raw ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w-]+/g, "")
    .toLowerCase()
    .trim();

// cache helpers
const getCachedMenu = (station: StationSlug): MenuSection[] | null => {
  try {
    const raw = localStorage.getItem(`${MENU_CACHE_KEY}:${station}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as MenuSection[];
  } catch {
    return null;
  }
};
const setCachedMenu = (station: StationSlug, sections: MenuSection[]) => {
  try {
    localStorage.setItem(
      `${MENU_CACHE_KEY}:${station}`,
      JSON.stringify(sections)
    );
  } catch {}
};

// valida y normaliza el slug que viene por URL
const normalizeStation = (slug: string | undefined | null): StationSlug => {
  const s = String(slug ?? "").toLowerCase();
  const found = STATIONS.find((x) => x.slug === s)?.slug;
  return (found ?? STATIONS[0].slug) as StationSlug;
};

/* -------- Bloqueo “amistoso” en landscape -------- */
function OrientationOverlay() {
  const [landscape, setLandscape] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)");
    const onChange = () =>
      setLandscape(mq.matches && window.innerWidth <= 1024);
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

/* -------- Skeleton corto -------- */
function TinySkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {[0, 1].map((s) => (
        <div key={s} className="mb-6">
          <div className="h-5 w-40 bg-neutral-200 rounded mb-3 animate-pulse" />
          <div className="rounded-2xl bg-white ring-1 ring-black/5 divide-y divide-neutral-200">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="h-4 w-48 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-neutral-100 rounded mt-2 animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Carrusel promos ---------------- */
function PromoCarousel({
  items,
  intervalMs = 5000,
}: {
  items: PromoItem[];
  intervalMs?: number;
}) {
  const images = useMemo(
    () =>
      items
        .filter(Boolean)
        .map((it) => ({ ...it, src: driveImage(it.mediaUrl) })),
    [items]
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % images.length),
      intervalMs
    );
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

              {(item.title ||
                item.subtitle ||
                (item.ctaText && item.ctaHref)) && (
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="max-w-xl rounded-xl bg-black/55 text-white p-3">
                    {item.title && (
                      <h3 className="text-lg font-semibold leading-tight">
                        {item.title}
                      </h3>
                    )}
                    {item.subtitle && (
                      <p className="text-sm opacity-90 mt-1">{item.subtitle}</p>
                    )}
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

/* ---------------- Lista simple ---------------- */
function Section({ section }: { section: MenuSection }) {
  return (
    <section id={section.id} className="max-w-3xl mx-auto px-4 py-8 scroll-mt-20">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        {section.title}
      </h2>
      <ul className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 divide-y divide-neutral-200">
        {section.items.map((it, i) => (
          <li key={i} className="flex items-start justify-between gap-4 p-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium leading-tight break-words">{it.name}</p>
              {it.desc && (
                <p className="text-sm text-neutral-500 break-words whitespace-normal">
                  {it.desc}
                </p>
              )}
            </div>
            <span className="font-semibold tabular-nums whitespace-nowrap">
              {formatPriceSafe(it.price) || " "}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------- Pósters múltiples + bloques ------------- */
function MenuSectionPosterMulti({
  section,
  posterSrcs,
  chunkSize,
  posterAlt = section.title,
}: {
  section: MenuSection;
  posterSrcs: string[];
  chunkSize: number;
  posterAlt?: string;
}) {
  const chunks: (typeof section.items)[] = [];
  for (let i = 0; i < section.items.length; i += chunkSize) {
    chunks.push(section.items.slice(i, i + chunkSize));
  }

  const isDiscounts = cleanId(section.id) === "descuentos";

  return (
    <section id={section.id} className="scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">
          {section.title}
        </h2>

        {chunks.map((itemsChunk, idx) => (
          <div key={idx} className="mb-7 last:mb-0">
            {posterSrcs[idx] && (
              <div className={isDiscounts ? "flex justify-center" : undefined}>
                <div
                  className={[
                    "rounded-2xl overflow-hidden ring-1 ring-black/10 shadow-sm bg-white",
                    // 👇 Mucho más chico en móvil, escalando de forma contenida
                    isDiscounts
                      ? "w-full mx-auto max-w-[340px] sm:max-w-[420px] md:max-w-[520px]"
                      : "",
                  ].join(" ")}
                >
                  <img
                    src={posterSrcs[idx]}
                    alt={posterAlt}
                    className={isDiscounts ? "w-full h-auto object-contain" : "w-full h-auto object-cover"}
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {!!itemsChunk.length && (
              <ul className="mt-5 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 divide-y divide-neutral-200">
                {itemsChunk.map((it, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-4 p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium leading-tight break-words">
                        {it.name}
                      </p>
                      {it.desc && (
                        <p className="text-sm text-neutral-500 break-words whitespace-normal">
                          {it.desc}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold tabular-nums whitespace-nowrap">
                      {formatPriceSafe(it.price) || " "}
                    </span>
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
  const params = useParams<{ station: string }>();
  const router = useRouter();

  const urlStation = normalizeStation(params?.station);
  const [station, setStation] = useState<StationSlug>(urlStation);

  useEffect(() => {
    setStation(urlStation);
  }, [urlStation]);

  useEffect(() => {
    const normalized = normalizeStation(params?.station);
    if (normalized !== params?.station) {
      router.replace(`/ypf-menu/${normalized}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [sections, setSections] = useState<MenuSection[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(STATION_KEY, station);
    } catch {}

    const cached = getCachedMenu(station);
    if (cached && cached.length) setSections(cached);

    (async () => {
      try {
        const res = await fetch(`/api/menu?station=${station}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.sections)) {
            setSections(data.sections as MenuSection[]);
            setCachedMenu(station, data.sections as MenuSection[]);
          } else {
            setSections(DEFAULT_MENU);
            setCachedMenu(station, DEFAULT_MENU);
          }
        } else {
          setSections(DEFAULT_MENU);
          setCachedMenu(station, DEFAULT_MENU);
        }
      } catch {
        setSections((prev) => prev ?? DEFAULT_MENU);
      } finally {
        setLoading(false);
      }
    })();
  }, [station]);

  /* --------- Filtros/overrides por estación --------- */
  const POSTERS: Record<string, { posterSrcs: string[] }> = {
    descuentos: { posterSrcs: ["/acaDescuento.png"] },
    cafeteria: { posterSrcs: ["/listadocafeteria.png"] },
    cafeteriafull: { posterSrcs: ["/productosFull.jpg"] },
    desayunoamericano: { posterSrcs: ["/desayunoamericano.jpg"] },
    comidas: { posterSrcs: ["/listadocomida.png"] },
    panaderia: { posterSrcs: ["/listadopanaderia.png"] },
    hamburguesas: {
      posterSrcs: [
        "/comboshamburguesas.png",
        "/comboshamburguesas2.png",
        "/comboshamburguesas3.png",
      ],
    },
    hamburguesapollo: { posterSrcs: ["/comboshamburguesas4.png"] },
    ensaladas: { posterSrcs: ["/ensaladas.png"] },
  };

  const POSTERS_BY_STATION: Partial<
    Record<StationSlug, Record<string, { posterSrcs: string[] }>>
  > = {
    delivery: {
      cafeteria: { posterSrcs: [] },
      cafeteriafull: { posterSrcs: [] },
    },
  };

  const DEFAULT_CHUNK_BY_ID: Record<string, number> = {
    hamburguesas: 3,
    comidas: 20,
    panaderia: 8,
    cafeteria: 6,
    hamburguesapollo: 6,
    ensaladas: 6,
  };

  const visibleSections = useMemo(() => {
    let list = sections ?? [];
    if (station === "delivery") {
      const HIDE = new Set(["cafeteria", "cafeteriafull"]);
      list = list.filter((s) => !HIDE.has(cleanId(s.id)));
    }
    return list;
  }, [sections, station]);

  const tabs = useMemo(
    () => (visibleSections ?? []).map((s) => ({ id: s.id, label: s.title })),
    [visibleSections]
  );

  // PROMOS por estación: en delivery, vacío para ocultar carrusel
  const PROMOS_BY_STATION: Partial<Record<StationSlug, PromoItem[]>> = {
    delivery: [],
  };
  const promos: PromoItem[] = PROMOS_BY_STATION.hasOwnProperty(station)
    ? PROMOS_BY_STATION[station] ?? []
    : PROMOS;

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const stationName = STATIONS.find((s) => s.slug === station)?.name ?? "";

  return (
    <>
      <OrientationOverlay />

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-[#0033A0] text-white shadow"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-semibold whitespace-nowrap">
            YPF • Menú{" "}
            <span className="ml-1 text-xs sm:text-sm opacity-80">
              ({stationName})
            </span>
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir secciones"
              className="rounded-lg px-3 py-2 bg-white/10 hover:bg-white/20 active:bg-white/25"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop + sheet */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${
          menuOpen
            ? "opacity-100 bg-black/40"
            : "pointer-events-none opacity-0 bg-black/0"
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

      {/* Promos: sólo si hay para la estación */}
      {promos.length > 0 && (
        <section className="py-4">
          <PromoCarousel items={promos} intervalMs={5000} />
        </section>
      )}

      {/* Contenido / skeleton */}
      {loading && !getCachedMenu(station) ? (
        <TinySkeleton />
      ) : (
        (visibleSections ?? []).map((section) => {
          const key = cleanId(section.id);

          // 1) desde DB si tu API manda `posters`
          const postersFromDb: string[] = ((section as any).posters ?? []).map(
            (p: string) => driveImage(p)
          );

          // 2) override por estación
          const postersStation =
            POSTERS_BY_STATION[station]?.[key]?.posterSrcs ?? [];

          // 3) fallback global
          const postersFallback = POSTERS[key]?.posterSrcs ?? [];

          const posters =
            postersFromDb.length > 0
              ? postersFromDb
              : postersStation.length > 0
              ? postersStation
              : postersFallback;

          const chunk =
            (section as any).chunkSize ?? DEFAULT_CHUNK_BY_ID[key] ?? 3;

          return posters.length ? (
            <MenuSectionPosterMulti
              key={section.id}
              section={section}
              posterSrcs={posters}
              chunkSize={chunk}
            />
          ) : (
            <Section key={section.id} section={section} />
          );
        })
      )}

      <footer className="max-w-5xl mx-auto px-4 py-8 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Grupo GEN – Estaciones YPF
      </footer>
    </>
  );
}
