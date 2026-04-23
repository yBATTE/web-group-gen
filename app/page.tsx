import Link from "next/link"
import { STATIONS } from "@/lib/stations"

type StationCard = {
  slug: string
  name: string
  description?: string
}

function getStations(): StationCard[] {
  if (Array.isArray(STATIONS)) {
    return STATIONS.map((station: any) => ({
      slug: station.slug,
      name: station.name ?? station.title ?? station.slug,
      description: station.address ?? station.description ?? "",
    }))
  }

  return Object.entries(STATIONS as Record<string, any>).map(([slug, station]) => ({
    slug,
    name: station?.name ?? station?.title ?? slug,
    description: station?.address ?? station?.description ?? "",
  }))
}

export default function HomePage() {
  const stations = getStations()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-slate-300">
            Grupo GEN
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Menús digitales
          </h1>

          <p className="mt-3 max-w-2xl text-base text-slate-300 md:text-lg">
            Seleccioná una estación para ver su menú actualizado.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stations.map((station) => (
            <Link
              key={station.slug}
              href={`/ypf-menu/${station.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Estación</p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {station.name}
                  </h2>

                  {station.description ? (
                    <p className="mt-2 text-sm text-slate-300">
                      {station.description}
                    </p>
                  ) : null}
                </div>

                <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300">
                  Ver menú
                </span>
              </div>

              <div className="mt-6 text-sm text-slate-400 transition group-hover:text-white">
                Abrir menú →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/precios"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Administrar precios
          </Link>

          <a
            href="https://grupogen.com.ar"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Ir al sitio institucional
          </a>
        </div>
      </div>
    </main>
  )
}