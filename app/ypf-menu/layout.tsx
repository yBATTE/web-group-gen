"use client";
import { ThemeProvider } from "next-themes";

export default function LightThemeShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="light">
      <div className="min-h-screen bg-[#f6f8fb] text-neutral-900">
        {children}
      </div>
    </ThemeProvider>
  );
}
