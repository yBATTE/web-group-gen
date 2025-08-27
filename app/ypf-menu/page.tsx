// app/ypf-menu/page.tsx
"use client";

import { YPF_MENU_SECTIONS, type MenuSection } from "@/lib/constants";

function Section({ section }: { section: MenuSection }) {
  return (
    <section id={section.id} className="max-w-3xl mx-auto px-4 py-8">
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

export default function YpfMenuPage() {
  const links = YPF_MENU_SECTIONS.map(s => ({ id: s.id, label: s.title }));

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main>
      {/* Header azul YPF */}
      <header className="sticky top-0 z-20 bg-[#0033A0] text-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">YPF • Menú</h1>
          </div>
          <nav className="mt-3 flex flex-wrap gap-2">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="rounded-full bg-white/10 px-3 py-1 text-sm hover:bg-white/20 transition"
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero fino con azul de fondo para continuidad visual */}
      <div className="bg-[#0033A0]">
      </div>

      {/* Secciones */}
      {YPF_MENU_SECTIONS.map((section) => (
        <Section key={section.id} section={section} />
      ))}

      <footer className="max-w-5xl mx-auto px-4 pb-10 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Grupo GEN – Estaciones YPF
      </footer>
    </main>
  );
}
