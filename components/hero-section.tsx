"use client"

import { Button } from "@/components/ui/button"
import { HERO_CONTENT } from "@/lib/site-data"

export default function HeroSection() {
  const scrollToStations = () => {
    const element = document.getElementById("estaciones")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="inicio"
      className="relative h-screen flex items-center justify-center parallax-hero"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${HERO_CONTENT.backgroundImage}')`,
      }}
    >
      <div className="container mx-auto px-4 text-center text-white">
        <h1 className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl mb-6">{HERO_CONTENT.title}</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed">{HERO_CONTENT.subtitle}</p>
        <Button
          onClick={scrollToStations}
          size="lg"
          className="bg-ypf-blue hover:bg-ypf-blue-dark text-white px-8 py-3 text-lg font-medium cursor-pointer"
        >
          {HERO_CONTENT.ctaText}
        </Button>
      </div>
    </section>
  )
}
