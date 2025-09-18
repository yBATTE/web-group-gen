// app/api/menu/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import type { MenuDoc, MenuSection } from "@/lib/menu-types";
import { DEFAULT_MENU } from "@/lib/menu-data";
import { STATIONS } from "@/lib/stations";

/* ---------------- helpers ---------------- */
const isValidStation = (slug: string) =>
  !!STATIONS.find((s) => s.slug === slug);

const normalizeStation = (raw?: string | null) => {
  const slug = String(raw ?? "").toLowerCase();
  return isValidStation(slug) ? slug : STATIONS[0].slug;
};

// id con tipado correcto
const docIdFor = (station: string): `menu:${string}` =>
  `menu:${station}` as `menu:${string}`;

function toStr(v: unknown, def = ""): string {
  return typeof v === "string" ? v : def;
}
function toNum(v: unknown, def = 3): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

/** Normaliza el payload recibido (tipos y campos mínimos) */
function normalizeSections(input: unknown): MenuSection[] {
  if (!Array.isArray(input)) return [];
  return input.map((s: any) => {
    const items = Array.isArray(s?.items) ? s.items : [];
    return {
      id: toStr(s?.id),
      title: toStr(s?.title),
      chunkSize: toNum(s?.chunkSize, 3),
      items: items.map((it: any) => ({
        name: toStr(it?.name),
        desc: toStr(it?.desc, undefined as any),
        price: toStr(it?.price), // soporta "14900" o "14900/15700"
      })),
    } satisfies MenuSection;
  });
}

/* ===================== GET ===================== */
/** Devuelve el menú de la estación. Si no existe, lo siembra. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const station = normalizeStation(searchParams.get("station"));
  const _id = docIdFor(station);

  const db = await getDb();
  const col = db.collection<MenuDoc>("configs");

  // buscar el doc específico por estación
  let doc = await col.findOne({ _id });

  // si no existe, sembrar (intentamos copiar de un legado "_id: menu" si estaba)
  if (!doc) {
    const legacy = await col.findOne({ _id: "menu" });
    const sections = legacy?.sections ?? DEFAULT_MENU;
    doc = {
      _id,
      sections,
      updatedAt: new Date().toISOString(),
      station,
    } as MenuDoc;

    await col.updateOne({ _id }, { $set: doc }, { upsert: true });
  }

  return NextResponse.json(doc, { status: 200 });
}

/* ===================== PUT ===================== */
/** Actualiza el menú de la estación (protegido por sesión) */
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const station = normalizeStation(searchParams.get("station"));
  const _id = docIdFor(station);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sections = normalizeSections(body?.sections);
  if (!sections.length) {
    return NextResponse.json(
      { error: "Invalid payload: sections[]" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const col = db.collection<MenuDoc>("configs");

  await col.updateOne(
    { _id },
    {
      $set: {
        _id,
        sections,
        updatedAt: new Date().toISOString(),
        station,
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true }, { status: 200 });
}
