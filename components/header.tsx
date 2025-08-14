"use client"

import { useRef, useState, MouseEvent } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { COMPANY_INFO, NAVIGATION_LINKS } from "@/lib/constants"
import { ThemeToggle } from "./theme-toggle"

// Animación suave manual (ignora reduced-motion si querés)
function smoothScrollTo(targetY: number, duration = 600) {
  const startY = window.scrollY || window.pageYOffset
  const diff = targetY - startY
  const start = performance.now()

  function easeInOut(t: number) {
    return 0.5 - Math.cos(Math.PI * t) / 2
  }

  function step(now: number) {
    const p = Math.min(1, (now - start) / duration)
    const y = startY + diff * easeInOut(p)
    window.scrollTo(0, y)
    if (p < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  const onNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    const id = href.replace("#", "")
    const el = document.getElementById(id)
    if (!el) return

    e.preventDefault()

    const headerH =
      headerRef.current?.offsetHeight ??
      (document.querySelector("header") as HTMLElement | null)?.offsetHeight ??
      0

    const targetTop = el.getBoundingClientRect().top + window.pageYOffset - headerH

    // Si querés respetar reduced-motion, descomentá estas 2 líneas:
    // if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    //   window.scrollTo({ top: targetTop }) ; return
    // }

    smoothScrollTo(targetTop, 600)
    history.replaceState(null, "", `#${id}`)
    setIsMenuOpen(false)
  }

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800 transition-colors"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <img
                src={COMPANY_INFO.logo || "/placeholder.svg"}
                alt={`${COMPANY_INFO.name} Logo`}
                className="w-8 h-8 object-contain rounded-lg"
              />
            </div>
            <span className="font-heading font-bold text-xl text-gray-900 dark:text-white">
              {COMPANY_INFO.name}
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAVIGATION_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => onNavClick(e, link.href)}
                className="relative text-gray-700 dark:text-gray-300 hover:text-ypf-blue dark:hover:text-ypf-blue-light transition-all duration-300 font-medium hover:scale-105 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ypf-blue dark:bg-ypf-blue-light transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Theme + mobile */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:scale-110 transition-transform duration-200"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="Abrir menú"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t dark:border-gray-800">
            <nav className="flex flex-col space-y-4">
              {NAVIGATION_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => onNavClick(e, link.href)}
                  className="text-left text-gray-700 dark:text-gray-300 hover:text-ypf-blue dark:hover:text-ypf-blue-light transition-all duration-300 font-medium hover:translate-x-2 hover:scale-105"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
