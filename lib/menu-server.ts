// lib/menu-server.ts
import { DEFAULT_MENU } from "@/lib/menu-data";
import type { MenuDoc, MenuSection } from "@/lib/menu-types";

export async function loadMenu(): Promise<MenuSection[]> {
  try {
    // 'no-store' => nada de caché; siempre trae lo último
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/menu`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("GET /api/menu failed");
    const doc = (await res.json()) as MenuDoc | null;
    return doc?.sections ?? DEFAULT_MENU;
  } catch {
    return DEFAULT_MENU;
  }
}
