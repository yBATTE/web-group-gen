// app/api/menu/route.ts
import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongo"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import type { MenuDoc, MenuSection } from "@/lib/menu-types"
import { DEFAULT_MENU } from "@/lib/menu-data"

/* -------- helpers -------- */
function toStr(v: unknown, def = ""): string {
  return typeof v === "string" ? v : def
}
function toNum(v: unknown, def = 3): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : def
}

/** Normaliza el payload recibido (tipos y campos mínimos) */
function normalizeSections(input: unknown): MenuSection[] {
  if (!Array.isArray(input)) return []

  return input.map((s: any) => {
    const items = Array.isArray(s?.items) ? s.items : []
    return {
      id: toStr(s?.id),
      title: toStr(s?.title),
      chunkSize: toNum(s?.chunkSize, 3),
      items: items.map((it: any) => ({
        name: toStr(it?.name),
        desc: toStr(it?.desc, undefined as any),
        price: toStr(it?.price),
      })),
    } satisfies MenuSection
  })
}

/* ===================== GET ===================== */
/** Devuelve el menú. Si no existe, siembra con DEFAULT_MENU. */
export async function GET() {
  const db = await getDb()
  const col = db.collection<MenuDoc>("configs")

  let doc = await col.findOne({ _id: "menu" })
  if (!doc) {
    const now = new Date().toISOString()
    doc = { _id: "menu", sections: DEFAULT_MENU, updatedAt: now }
    await col.insertOne(doc)
  }

  return NextResponse.json(doc, { status: 200 })
}

/* ===================== PUT ===================== */
/** Actualiza el menú (protegido por sesión) */
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const sections = normalizeSections(body?.sections)
  if (!sections.length) {
    return NextResponse.json({ error: "Invalid payload: sections[]" }, { status: 400 })
  }

  const db = await getDb()
  const col = db.collection<MenuDoc>("configs")

  await col.updateOne(
    { _id: "menu" },
    {
      $set: {
        _id: "menu",
        sections,                       // <-- guarda chunkSize por sección
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  )

  return NextResponse.json({ ok: true }, { status: 200 })
}
