// app/api/menu/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import type { MenuDoc, MenuSection } from "@/lib/menu-types";
import { DEFAULT_MENU } from "@/lib/menu-data";
import { STATIONS, type StationSlug } from "@/lib/stations";

/* ---------------- helpers ---------------- */
const isValidStation = (slug: string): slug is StationSlug =>
  !!STATIONS.find((s) => s.slug === slug);

const normalizeStation = (raw?: string | null): StationSlug => {
  const slug = String(raw ?? "").toLowerCase();
  return isValidStation(slug) ? slug : STATIONS[0].slug;
};

const docIdFor = (station: string): `menu:${string}` =>
  `menu:${station}` as `menu:${string}`;

function toStr(v: unknown, def = ""): string {
  return typeof v === "string" ? v : def;
}

function toNum(v: unknown, def = 3): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function toStrArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSections(input: unknown): MenuSection[] {
  if (!Array.isArray(input)) return [];

  return input.map((s: any) => {
    const items = Array.isArray(s?.items) ? s.items : [];
    const posterSrcs = toStrArray(s?.posterSrcs);
    const posterPublicIds = toStrArray(s?.posterPublicIds);

    return {
      id: toStr(s?.id),
      title: toStr(s?.title),
      chunkSize: toNum(s?.chunkSize, 3),
      items: items.map((it: any) => ({
        name: toStr(it?.name),
        desc: typeof it?.desc === "string" ? it.desc : "",
        price: toStr(it?.price),
      })),
      ...(posterSrcs.length ? { posterSrcs } : {}),
      ...(posterPublicIds.length ? { posterPublicIds } : {}),
    } satisfies MenuSection;
  });
}

async function getSessionStation(): Promise<StationSlug | null> {
  const session = await getServerSession(authOptions);
  const station = (session?.user as any)?.station;
  return typeof station === "string" && isValidStation(station)
    ? station
    : null;
}

/* ===================== GET ===================== */
/**
 * Público: usa ?station=...
 * Admin logueado: si no viene station, usa la station de la sesión
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const sessionStation = await getSessionStation();
  const requestedStation = searchParams.get("station");

  const station =
    sessionStation && !requestedStation
      ? sessionStation
      : normalizeStation(requestedStation);

  const _id = docIdFor(station);

  const db = await getDb();
  const col = db.collection<MenuDoc>("configs");

  let doc = await col.findOne({ _id });

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
/**
 * SOLO usa la estación de la sesión
 */
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const station = (session?.user as any)?.station;

  if (!session || typeof station !== "string" || !isValidStation(station)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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