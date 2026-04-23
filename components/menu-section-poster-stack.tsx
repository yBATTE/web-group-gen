"use client";

import type { MenuSection } from "@/lib/menu-types";

export default function MenuSectionPosterStack({
  section,
  posterSrcs = [],
  posterAlt = section.title,
}: {
  section: MenuSection;
  posterSrcs?: string[];
  posterAlt?: string;
}) {
  const posters = Array.isArray(posterSrcs)
    ? posterSrcs.filter(Boolean)
    : [];

  return (
    <section id={section.id} className="scroll-mt-24">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          {section.title}
        </h2>

        {posters.length > 0 && (
          <div className="space-y-4">
            {posters.map((src, index) => (
              <div
                key={`${section.id}-poster-${index}`}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/10"
              >
                <img
                  src={src}
                  alt={`${posterAlt} ${index + 1}`}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        <ul className="mt-5 divide-y divide-neutral-200 rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          {section.items.map((it, i) => (
            <li key={i} className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-medium leading-tight">{it.name}</p>
                {it.desc && (
                  <p className="text-sm text-neutral-500">{it.desc}</p>
                )}
              </div>

              <span className="whitespace-nowrap font-semibold tabular-nums">
                {it.price}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}