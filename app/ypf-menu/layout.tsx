"use client";
import { ThemeProvider } from "next-themes";
import type React from "react";

/**
 * Layout SOLO para /ypf-menu
 * - Fondo azul fijo a pantalla completa (evita negro/blanco en el rebote)
 * - Contenedor de scroll propio con overscroll-contain (no rebota el viewport)
 * - Deja espacio arriba para el header fijo: 56px + safe-area
 */
export default function YpfMenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="light">
      {/* Capa azul atrás de todo */}
      <div className="fixed inset-0 bg-[#0033A0] -z-10" />

      {/* Contenedor de scroll de la página del menú */}
      <div
        className="
          fixed inset-0 
          overflow-y-auto overscroll-contain
          bg-[#f6f8fb] text-neutral-900
          pt-[calc(env(safe-area-inset-top)+56px)]   /* deja lugar para el header fijo */
          pb-[env(safe-area-inset-bottom)]          /* respeta safe-area inferior */
        "
      >
        {children}
      </div>
    </ThemeProvider>
  );
}
