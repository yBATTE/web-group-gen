"use client"

import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { COMPANY_INFO, SOCIAL_MEDIA, FOOTER_LINKS, LEGAL_LINKS } from "@/lib/constants"

export default function Footer() {
  const pathname = usePathname()

  // Fallback manual (funciona aunque el browser desactive smooth)
  const animateScrollTo = (yTarget: number, ms = 600) => {
    const startY = window.scrollY || window.pageYOffset
    const dist = yTarget - startY
    if (Math.abs(dist) < 1) return

    let start: number | null = null
    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

    const step = (ts: number) => {
      if (start === null) start = ts
      const p = Math.min((ts - start) / ms, 1)
      const eased = easeInOut(p)
      window.scrollTo(0, startY + dist * eased)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  const smoothScrollToId = (id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    const header = document.querySelector("header") as HTMLElement | null
    const offset = header?.offsetHeight ?? 0
    const y = target.getBoundingClientRect().top + window.scrollY - offset - 8

    // si el navegador soporta smooth y no hay reduce-motion, usá nativo; sino, fallback
    const supports = "scrollBehavior" in document.documentElement.style
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    if (supports && !reduce) {
      window.scrollTo({ top: y, behavior: "smooth" })
    } else {
      animateScrollTo(y, 600)
    }

    history.replaceState(null, "", `#${id}`)
  }

  const onFooterLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (!href.startsWith("#")) return
    if (pathname !== "/") return // si estás en otra ruta, navegá normal a "/#id"
    e.preventDefault()
    smoothScrollToId(href.slice(1))
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <img
                  src={COMPANY_INFO.logo || "/placeholder.svg"}
                  alt={`${COMPANY_INFO.name} Logo`}
                  className="w-8 h-8 object-contain rounded-lg"
                />
              </div>
              <span className="font-heading font-bold text-xl">{COMPANY_INFO.name}</span>
            </div>
            <p className="text-gray-300 leading-relaxed">{COMPANY_INFO.description}</p>
          </div>

          {/* Enlaces */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg">Enlaces</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => {
                const isHash = link.href.startsWith("#")
                const asHref = isHash ? `/${link.href}` : link.href
                return (
                  <li key={link.label}>
                    <Link
                      href={asHref}
                      onClick={(e) => onFooterLinkClick(e, link.href)}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-ypf-blue mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">
                  {COMPANY_INFO.address.street}
                  <br />
                  {COMPANY_INFO.address.city}, {COMPANY_INFO.address.country}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-ypf-blue flex-shrink-0" />
                <a href={`tel:${COMPANY_INFO.contact.phone}`} className="text-gray-300 hover:text-white transition-colors">
                  {COMPANY_INFO.contact.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-ypf-blue flex-shrink-0" />
                <a href={`mailto:${COMPANY_INFO.contact.email}`} className="text-gray-300 hover:text-white transition-colors">
                  {COMPANY_INFO.contact.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Redes */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg">Redes Sociales</h3>
            <div className="flex gap-4">
              <a href={SOCIAL_MEDIA.facebook} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-ypf-blue transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href={SOCIAL_MEDIA.twitter} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-ypf-blue transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href={SOCIAL_MEDIA.instagram} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-ypf-blue transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={SOCIAL_MEDIA.linkedin} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-ypf-blue transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2025 {COMPANY_INFO.name} · Todos los derechos reservados</p>
            <div className="flex gap-6">
              {LEGAL_LINKS.map((link) => (
                <Link key={link.label} href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
