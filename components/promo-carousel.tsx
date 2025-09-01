"use client"

import { useEffect, useMemo, useState } from "react"

type PromoItem = {
  id: string
  title?: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
  mediaUrl: string
  mediaType: "image" | "video"
}

function getDriveEmbed(url: string, type: "image" | "video") {
  const idMatch =
    url.match(/\/d\/([^/]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/[?&]fileId=([^&]+)/)?.[1]

  if (!idMatch) return url

  if (type === "image") {
    return `https://drive.google.com/uc?export=view&id=${idMatch}`
  }
  return `https://drive.google.com/file/d/${idMatch}/preview`
}

export default function PromoCarousel({
  items,
  intervalMs = 5000,
}: {
  items: PromoItem[]
  intervalMs?: number
}) {
  const [index, setIndex] = useState(0)

  const prepared = useMemo(
    () =>
      items.map((it) => ({
        ...it,
        embedUrl: getDriveEmbed(it.mediaUrl, it.mediaType),
      })),
    [items]
  )

  useEffect(() => {
    if (prepared.length <= 1) return
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % prepared.length)
    }, intervalMs)
    return () => clearInterval(t)
  }, [prepared.length, intervalMs])

  const go = (i: number) => setIndex((i + prepared.length) % prepared.length)
  const current = prepared[index]

  return (
    <div className="relative w-full max-w-5xl mx-auto px-3">
      <div className="relative w-full overflow-hidden rounded-2xl shadow-lg bg-white/50 dark:bg-gray-800/40 backdrop-blur">
        <div className="w-full aspect-[16/9]">
          {current.mediaType === "image" ? (
            <img
              src={current.embedUrl}
              alt={current.title ?? "Promo"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <iframe
              src={current.embedUrl}
              className="h-full w-full"
              allow="autoplay"
              allowFullScreen
            />
          )}
        </div>

        {(current.title || current.subtitle || current.ctaText) && (
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <div className="max-w-xl rounded-xl bg-black/55 text-white p-3 sm:p-4">
              {current.title && (
                <h3 className="text-lg sm:text-2xl font-semibold leading-tight">
                  {current.title}
                </h3>
              )}
              {current.subtitle && (
                <p className="text-sm sm:text-base opacity-90 mt-1">
                  {current.subtitle}
                </p>
              )}
              {current.ctaText && current.ctaHref && (
                <a
                  href={current.ctaHref}
                  className="inline-block mt-3 rounded-xl px-4 py-2 bg-yellow-400 text-gray-900 font-semibold hover:brightness-105"
                >
                  {current.ctaText}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Controles */}
        <button
          onClick={() => go(index - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 text-white px-3 py-2 hover:bg-black/60"
          aria-label="Anterior"
        >
          ‹
        </button>
        <button
          onClick={() => go(index + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 text-white px-3 py-2 hover:bg-black/60"
          aria-label="Siguiente"
        >
          ›
        </button>

        {/* Dots */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
          {prepared.map((_, i) => (
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
  )
}
