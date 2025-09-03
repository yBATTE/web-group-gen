"use client"

import type { MenuSection } from "@/lib/menu-data"

export default function MenuSectionPosterStack({
  section,
  posterSrc,
  posterAlt = section.title,
}: {
  section: MenuSection
  posterSrc: string         // ej: "/listadocafeteria.png" (archivo en /public)
  posterAlt?: string
}) {
  return (
    <section id={section.id} className="scroll-mt-24">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Título */}
        <h2 className="text-2xl font-semibold tracking-tight mb-4">
          {section.title}
        </h2>

        {/* Poster arriba */}
        <div className="rounded-2xl overflow-hidden ring-1 ring-black/10 shadow-sm bg-white">
          <img
            src={posterSrc}
            alt={posterAlt}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>

        {/* Lista de precios debajo */}
        <ul className="mt-5 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 divide-y divide-neutral-200">
          {section.items.map((it, i) => (
            <li key={i} className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-medium leading-tight">{it.name}</p>
                {it.desc && (
                  <p className="text-sm text-neutral-500">{it.desc}</p>
                )}
              </div>
              <span className="font-semibold tabular-nums whitespace-nowrap">
                {it.price}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
