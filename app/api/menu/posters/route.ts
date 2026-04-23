// app/api/menu/posters/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongo";
import { DEFAULT_MENU } from "@/lib/menu-data";
import type { MenuDoc, MenuSection } from "@/lib/menu-types";
import { STATIONS, type StationSlug } from "@/lib/stations";
import {
  destroyFromCloudinary,
  uploadBufferToCloudinary,
} from "@/lib/cloudinary";

export const runtime = "nodejs";

const isValidStation = (slug: string): slug is StationSlug =>
  !!STATIONS.find((s) => s.slug === slug);

const docIdFor = (station: string): `menu:${string}` =>
  `menu:${station}` as `menu:${string}`;

function cloneSections(sections: MenuSection[]): MenuSection[] {
  return sections.map((section) => ({
    ...section,
    items: Array.isArray(section.items)
      ? section.items.map((item) => ({ ...item }))
      : [],
    posterSrcs: Array.isArray(section.posterSrcs)
      ? [...section.posterSrcs]
      : [],
    posterPublicIds: Array.isArray(section.posterPublicIds)
      ? [...section.posterPublicIds]
      : [],
  }));
}

async function ensureMenuDoc(station: StationSlug) {
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

  return { _id, db, col, doc };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const station = (session?.user as any)?.station;

  if (!session || typeof station !== "string" || !isValidStation(station)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const sectionId = String(formData.get("sectionId") ?? "").trim();

  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File);

  if (!sectionId) {
    return NextResponse.json({ error: "Falta sectionId" }, { status: 400 });
  }

  if (!files.length) {
    return NextResponse.json({ error: "No se enviaron archivos" }, { status: 400 });
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Solo se permiten imágenes" },
        { status: 400 }
      );
    }
  }

  const { _id, col, doc } = await ensureMenuDoc(station);
  const sections = cloneSections(doc.sections ?? []);
  const sectionIndex = sections.findIndex((section) => section.id === sectionId);

  if (sectionIndex === -1) {
    return NextResponse.json({ error: "Sección no encontrada" }, { status: 404 });
  }

  const uploads: { secure_url: string; public_id: string }[] = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadBufferToCloudinary(
      buffer,
      `ypf-menu/${station}/${sectionId}`
    );

    uploads.push(uploaded);
  }

  const current = sections[sectionIndex];

  sections[sectionIndex] = {
    ...current,
    posterSrcs: [
      ...(Array.isArray(current.posterSrcs) ? current.posterSrcs : []),
      ...uploads.map((u) => u.secure_url),
    ],
    posterPublicIds: [
      ...(Array.isArray(current.posterPublicIds) ? current.posterPublicIds : []),
      ...uploads.map((u) => u.public_id),
    ],
  };

  await col.updateOne(
    { _id },
    {
      $set: {
        sections,
        station,
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({
    ok: true,
    section: sections[sectionIndex],
  });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const station = (session?.user as any)?.station;

  if (!session || typeof station !== "string" || !isValidStation(station)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sectionId = String(body?.sectionId ?? "").trim();
  const posterIndex = Number(body?.posterIndex);

  if (!sectionId || !Number.isInteger(posterIndex) || posterIndex < 0) {
    return NextResponse.json(
      { error: "sectionId o posterIndex inválido" },
      { status: 400 }
    );
  }

  const { _id, col, doc } = await ensureMenuDoc(station);
  const sections = cloneSections(doc.sections ?? []);
  const sectionIndex = sections.findIndex((section) => section.id === sectionId);

  if (sectionIndex === -1) {
    return NextResponse.json({ error: "Sección no encontrada" }, { status: 404 });
  }

  const current = sections[sectionIndex];
  const posterSrcs = Array.isArray(current.posterSrcs) ? [...current.posterSrcs] : [];
  const posterPublicIds = Array.isArray(current.posterPublicIds)
    ? [...current.posterPublicIds]
    : [];

  if (posterIndex >= posterSrcs.length) {
    return NextResponse.json({ error: "Poster no encontrado" }, { status: 404 });
  }

  const publicIdToDelete =
    posterIndex < posterPublicIds.length ? posterPublicIds[posterIndex] : undefined;

  posterSrcs.splice(posterIndex, 1);
  if (posterIndex < posterPublicIds.length) {
    posterPublicIds.splice(posterIndex, 1);
  }

  if (publicIdToDelete) {
    await destroyFromCloudinary(publicIdToDelete);
  }

  sections[sectionIndex] = {
    ...current,
    posterSrcs,
    posterPublicIds,
  };

  await col.updateOne(
    { _id },
    {
      $set: {
        sections,
        station,
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({
    ok: true,
    section: sections[sectionIndex],
  });
}