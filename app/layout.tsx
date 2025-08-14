import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script" // <-- importar

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Grupo GEN - Estaciones YPF",
  description:
    "Descubre calidad y servicio en cada estación YPF. Grupo GEN - Impulsando el viaje de Argentina.",
  icons: {
    icon: "logo-grupo-gen-redondo.png",
  },
  generator: "v0.app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
      </head>
      <body
        className={`min-h-screen ${spaceGrotesk.variable} ${dmSans.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system" storageKey="ypf-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
