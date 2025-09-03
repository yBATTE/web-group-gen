"use client"
import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

export default function PreciosLayout({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
