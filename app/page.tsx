import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import NewsSection from "@/components/news-section"
import AboutUsSection from "@/components/about-us-section"
import StationsSection from "@/components/stations-section"
import ContactSection from "@/components/contact-section"
import Footer from "@/components/footer"
import MapModal from "@/components/map-modal"

export default function HomePage() {
  return (
    <>
      {/* Header fijo */}
      <Header />

      {/* IMPORTANTE: sin h-screen ni overflow-y-auto */}
      <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 pt-16">
        {/* Inicio (id acá) */}
        <section id="inicio" className="scroll-mt-24">
          <HeroSection />
          <NewsSection />
        </section>

        {/* Estas secciones ya traen su propio id y scroll-mt en el componente */}
        <AboutUsSection />   {/* id="sobre-nosotros" dentro */}
        <StationsSection />  {/* id="estaciones" dentro */}
        <ContactSection />   {/* id="contacto" dentro */}

        <Footer />
        <MapModal />
      </main>
    </>
  )
}
