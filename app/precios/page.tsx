"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import type { MenuSection, MenuItem } from "@/lib/menu-types";
import { STATIONS, type StationSlug } from "@/lib/stations";

type ApiDoc = {
  _id: string;
  sections: MenuSection[];
  updatedAt?: string;
};

const uid = () =>
  `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const toNumber = (v: unknown, def = 3) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const toStrArray = (v: unknown): string[] => {
  if (!Array.isArray(v)) return [];
  return v
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
};

const EMPTY_ITEM: MenuItem = { name: "", desc: "", price: "" };

const EMPTY_SECTION = (): MenuSection => ({
  id: uid(),
  title: "",
  chunkSize: 3,
  items: [],
  posterSrcs: [],
  posterPublicIds: [],
});

function normalizeSection(input: any): MenuSection {
  return {
    id: input?.id || uid(),
    title: input?.title || "",
    chunkSize: toNumber(input?.chunkSize, 3),
    items: Array.isArray(input?.items)
      ? input.items.map((it: any) => ({
          name: it?.name || "",
          desc: it?.desc || "",
          price: String(it?.price ?? ""),
        }))
      : [],
    posterSrcs: toStrArray(input?.posterSrcs),
    posterPublicIds: toStrArray(input?.posterPublicIds),
  };
}

function buildPayload(sections: MenuSection[]) {
  return {
    sections: sections.map((s) => ({
      id: s.id || uid(),
      title: s.title || "",
      chunkSize: toNumber(s.chunkSize, 3),
      items: s.items.map((it) => ({
        name: it.name || "",
        desc: it.desc || "",
        price: String(it.price ?? ""),
      })),
      posterSrcs: Array.isArray(s.posterSrcs) ? s.posterSrcs : [],
      posterPublicIds: Array.isArray(s.posterPublicIds)
        ? s.posterPublicIds
        : [],
    })),
  };
}

export default function PreciosPage() {
  const { data: session, status } = useSession({ required: true });

  const station = (session?.user as any)?.station as StationSlug | undefined;

  const [sections, setSections] = useState<MenuSection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingSectionId, setSavingSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(
    null
  );
  const [deletingPosterKey, setDeletingPosterKey] = useState<string | null>(
    null
  );

  const stationName = useMemo(
    () => STATIONS.find((s) => s.slug === station)?.name ?? "",
    [station]
  );

  useEffect(() => {
    if (!station) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      setSections(null);

      try {
        const res = await fetch(`/api/menu`, {
          cache: "no-store",
        });

        const json: ApiDoc | null = await res.json();
        if (!res.ok) throw new Error((json as any)?.error || res.statusText);

        const loaded = Array.isArray(json?.sections) ? json.sections : [];
        setSections(loaded.map((section) => normalizeSection(section)));
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Error al cargar el menú");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [station]);

  const replaceSectionById = (sectionId: string, nextSection: MenuSection) => {
    setSections((prev) => {
      if (!prev) return prev;
      return prev.map((section) =>
        section.id === sectionId ? normalizeSection(nextSection) : section
      );
    });
  };

  const changeSec = (idx: number, patch: Partial<MenuSection>) => {
    setSections((prev) => {
      if (!prev) return prev;

      const next = prev.map((s) => ({
        ...s,
        items: s.items.map((i) => ({ ...i })),
        posterSrcs: [...(s.posterSrcs ?? [])],
        posterPublicIds: [...(s.posterPublicIds ?? [])],
      }));

      next[idx] = { ...next[idx], ...patch };

      return next;
    });
  };

  const changeItem = (si: number, ii: number, patch: Partial<MenuItem>) => {
    setSections((prev) => {
      if (!prev) return prev;

      const next = prev.map((s) => ({
        ...s,
        items: s.items.map((i) => ({ ...i })),
        posterSrcs: [...(s.posterSrcs ?? [])],
        posterPublicIds: [...(s.posterPublicIds ?? [])],
      }));

      next[si].items[ii] = { ...next[si].items[ii], ...patch };

      return next;
    });
  };

  const addSection = () => {
    setSections((prev) => [...(prev ?? []), EMPTY_SECTION()]);
  };

  const removeSection = (si: number) => {
    const ok = confirm("¿Seguro que querés eliminar esta sección?");
    if (!ok) return;

    setSections((prev) => {
      if (!prev) return prev;

      const next = prev.slice();
      next.splice(si, 1);

      return next;
    });
  };

  const addItem = (si: number) => {
    setSections((prev) => {
      if (!prev) return prev;

      const next = prev.map((s) => ({
        ...s,
        items: s.items.map((i) => ({ ...i })),
        posterSrcs: [...(s.posterSrcs ?? [])],
        posterPublicIds: [...(s.posterPublicIds ?? [])],
      }));

      next[si].items.push({ ...EMPTY_ITEM });

      return next;
    });
  };

  const removeItem = (si: number, ii: number) => {
    setSections((prev) => {
      if (!prev) return prev;

      const next = prev.map((s) => ({
        ...s,
        items: s.items.slice(),
        posterSrcs: [...(s.posterSrcs ?? [])],
        posterPublicIds: [...(s.posterPublicIds ?? [])],
      }));

      next[si].items.splice(ii, 1);

      return next;
    });
  };

  const moveSection = (from: number, to: number) => {
    setSections((prev) => {
      if (!prev) return prev;
      if (to < 0 || to >= prev.length) return prev;

      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);

      return next;
    });
  };

  const uploadPosters = async (sectionId: string, files: FileList | File[]) => {
    const picked = Array.from(files);
    if (!picked.length) return;

    setUploadingSectionId(sectionId);

    try {
      const formData = new FormData();
      formData.append("sectionId", sectionId);

      for (const file of picked) {
        formData.append("files", file);
      }

      const res = await fetch("/api/menu/posters", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || res.statusText);

      replaceSectionById(sectionId, json.section);
    } catch (e: any) {
      alert(`Error al subir imágenes: ${e?.message ?? e}`);
    } finally {
      setUploadingSectionId(null);
    }
  };

  const deletePoster = async (sectionId: string, posterIndex: number) => {
    const ok = confirm("¿Seguro que querés eliminar esta imagen?");
    if (!ok) return;

    const key = `${sectionId}:${posterIndex}`;
    setDeletingPosterKey(key);

    try {
      const res = await fetch("/api/menu/posters", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, posterIndex }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || res.statusText);

      replaceSectionById(sectionId, json.section);
    } catch (e: any) {
      alert(`Error al borrar imagen: ${e?.message ?? e}`);
    } finally {
      setDeletingPosterKey(null);
    }
  };

  const saveMenu = async (
    nextSections: MenuSection[],
    successMessage = "¡Cambios guardados!"
  ) => {
    const payload = buildPayload(nextSections);

    const res = await fetch(`/api/menu`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || res.statusText);

    alert(successMessage);
  };

  const save = async () => {
    if (!sections) return;

    setSaving(true);

    try {
      await saveMenu(sections, "¡Todos los cambios fueron guardados!");
    } catch (e: any) {
      alert(`Error al guardar: ${e?.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  const saveSection = async (sectionId: string) => {
    if (!sections) return;

    setSavingSectionId(sectionId);

    try {
      await saveMenu(sections, "¡Sección guardada!");
    } catch (e: any) {
      alert(`Error al guardar la sección: ${e?.message ?? e}`);
    } finally {
      setSavingSectionId(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="light-scope precios-page">
        <p className="page-loading">Autenticando…</p>
      </div>
    );
  }

  const isSavingAny = saving || savingSectionId !== null;

  return (
    <div className="light-scope precios-page">
      <style jsx global>{`
        .precios-page {
          min-height: 100dvh;
          background: #f8fafc;
          color: #111827;
        }

        .precios-container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 24px 16px 90px;
        }

        .page-loading {
          padding: 16px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 18px;
        }

        .page-title {
          margin: 0;
          font-size: 28px;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .page-subtitle {
          margin: 8px 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .page-note {
          margin: 6px 0 0;
          color: #6b7280;
          font-size: 13px;
          max-width: 620px;
          line-height: 1.45;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .section-card {
          margin-top: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 18px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
        }

        .section-top {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(210px, 0.9fr) 130px auto;
          gap: 12px;
          align-items: end;
        }

        .field {
          min-width: 0;
        }

        .field-label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
        }

        .required {
          color: #dc2626;
        }

        .input {
          width: 100%;
          min-height: 44px;
          padding: 11px 12px;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          background: #ffffff;
          color: #111827;
          font-size: 15px;
          outline: none;
        }

        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .input-readonly {
          border-color: #e5e7eb;
          background: #f9fafb;
          color: #6b7280;
        }

        .input-error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .section-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          align-items: center;
          flex-wrap: wrap;
        }

        .btn {
          min-height: 44px;
          border: none;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.08s ease, opacity 0.08s ease;
          white-space: nowrap;
        }

        .btn:active {
          transform: scale(0.98);
        }

        .btn:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-green {
          background: #10b981;
          color: white;
        }

        .btn-dark {
          background: #111827;
          color: white;
        }

        .btn-red {
          background: #ef4444;
          color: white;
        }

        .btn-gray {
          background: #f3f4f6;
          color: #111827;
        }

        .btn-danger-soft {
          background: #fee2e2;
          color: #b91c1c;
        }

        .btn-info-soft {
          background: #e0f2fe;
          color: #075985;
        }

        .poster-area {
          margin-top: 20px;
        }

        .poster-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .poster-title {
          font-weight: 800;
          font-size: 15px;
        }

        .poster-desc {
          margin-top: 4px;
          font-size: 13px;
          color: #6b7280;
          line-height: 1.45;
        }

        .poster-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
          margin-bottom: 8px;
        }

        .poster-card {
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          background: white;
        }

        .poster-img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          display: block;
          background: #f3f4f6;
        }

        .poster-card-actions {
          padding: 10px;
        }

        .empty-poster {
          margin-bottom: 8px;
          border: 1px dashed #d1d5db;
          border-radius: 14px;
          padding: 14px;
          color: #6b7280;
          background: #fafafa;
          font-size: 14px;
          line-height: 1.45;
        }

        .items-head {
          display: grid;
          grid-template-columns: 1.2fr 1.4fr 0.6fr 96px;
          gap: 12px;
          margin-top: 18px;
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
        }

        .item-row {
          display: grid;
          grid-template-columns: 1.2fr 1.4fr 0.6fr 96px;
          gap: 12px;
          margin-top: 10px;
          align-items: end;
        }

        .mobile-label {
          display: none;
        }

        .section-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .bottom-save {
          position: sticky;
          bottom: 0;
          margin-top: 24px;
          padding: 14px 0;
          background: linear-gradient(
            to top,
            #f8fafc 70%,
            rgba(248, 250, 252, 0)
          );
          z-index: 10;
        }

        .bottom-save-inner {
          display: flex;
          justify-content: flex-end;
        }

        .error-message {
          color: crimson;
          margin-top: 8px;
          font-size: 14px;
        }

        .loading-message {
          margin-top: 8px;
          color: #6b7280;
        }

        @media (max-width: 820px) {
          .precios-container {
            padding: 18px 12px 90px;
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .page-title {
            font-size: 24px;
          }

          .header-actions {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .header-actions .btn {
            width: 100%;
          }

          .section-card {
            padding: 14px;
            border-radius: 16px;
          }

          .section-top {
            grid-template-columns: 1fr;
          }

          .section-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            width: 100%;
          }

          .section-actions .btn {
            width: 100%;
          }

          .section-actions .btn-save-section,
          .section-actions .btn-delete-section {
            grid-column: 1 / -1;
          }

          .poster-head {
            flex-direction: column;
            align-items: stretch;
          }

          .poster-head .btn,
          .poster-head label {
            width: 100%;
            text-align: center;
          }

          .poster-grid {
            grid-template-columns: 1fr;
          }

          .poster-img {
            height: 210px;
          }

          .items-head {
            display: none;
          }

          .item-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
            margin-top: 14px;
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            background: #f9fafb;
          }

          .mobile-label {
            display: block;
            margin-bottom: 6px;
            font-size: 12px;
            font-weight: 700;
            color: #6b7280;
          }

          .item-row .btn {
            width: 100%;
          }

          .section-footer {
            display: grid;
            grid-template-columns: 1fr;
          }

          .section-footer .btn {
            width: 100%;
          }

          .bottom-save-inner {
            display: block;
          }

          .bottom-save-inner .btn {
            width: 100%;
            min-height: 50px;
            font-size: 15px;
          }
        }

        @media (max-width: 430px) {
          .precios-container {
            padding-left: 10px;
            padding-right: 10px;
          }

          .header-actions {
            grid-template-columns: 1fr;
          }

          .section-actions {
            grid-template-columns: 1fr;
          }

          .poster-img {
            height: 190px;
          }
        }
      `}</style>

      <div className="precios-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Editar precios</h1>

            <p className="page-subtitle">
              Estación: <strong>{stationName}</strong>
            </p>

            <p className="page-note">
              Las imágenes se guardan apenas se suben. Usá el botón de cada
              sección para guardar rápido títulos, productos y precios.
            </p>
          </div>

          <div className="header-actions">
            <button className="btn btn-green" onClick={addSection}>
              + Agregar sección
            </button>

            <button
              className="btn btn-red"
              onClick={() => signOut({ callbackUrl: "/precios/login" })}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {error && <p className="error-message">Error: {error}</p>}

        {!error && (loading || sections === null) && (
          <p className="loading-message">Cargando menú…</p>
        )}

        {Array.isArray(sections) &&
          sections.map((sec, si) => {
            const titleInvalid = !sec.title.trim();
            const sectionIsSaving = savingSectionId === sec.id;

            return (
              <div className="section-card" key={sec.id}>
                <div className="section-top">
                  <div className="field">
                    <label className="field-label">
                      Título de la sección{" "}
                      <span className="required">*</span>
                    </label>

                    <input
                      className={`input ${titleInvalid ? "input-error" : ""}`}
                      value={sec.title ?? ""}
                      onChange={(e) => changeSec(si, { title: e.target.value })}
                      placeholder="Ej: Cafetería"
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">ID solo lectura</label>

                    <input
                      className="input input-readonly"
                      value={sec.id ?? ""}
                      readOnly
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">chunkSize</label>

                    <input
                      className="input"
                      type="number"
                      min={1}
                      value={Number(sec.chunkSize ?? 3)}
                      onChange={(e) =>
                        changeSec(si, {
                          chunkSize: toNumber(e.target.value, 3),
                        })
                      }
                    />
                  </div>

                  <div className="section-actions">
                    <button
                      className="btn btn-gray"
                      onClick={() => moveSection(si, si - 1)}
                      disabled={si === 0 || isSavingAny}
                      title="Subir sección"
                    >
                      ↑
                    </button>

                    <button
                      className="btn btn-gray"
                      onClick={() => moveSection(si, si + 1)}
                      disabled={si === sections.length - 1 || isSavingAny}
                      title="Bajar sección"
                    >
                      ↓
                    </button>

                    <button
                      className="btn btn-primary btn-save-section"
                      onClick={() => saveSection(sec.id)}
                      disabled={isSavingAny || !sections}
                    >
                      {sectionIsSaving ? "Guardando..." : "Guardar sección"}
                    </button>

                    <button
                      className="btn btn-danger-soft btn-delete-section"
                      onClick={() => removeSection(si)}
                      disabled={isSavingAny}
                    >
                      Eliminar sección
                    </button>
                  </div>
                </div>

                <div className="poster-area">
                  <div className="poster-head">
                    <div>
                      <div className="poster-title">Posters de la sección</div>

                      <div className="poster-desc">
                        Si no cargás nada en Mongo, después en la parte pública
                        podés seguir usando fallback local.
                      </div>
                    </div>

                    <label
                      className="btn btn-dark"
                      style={{
                        cursor:
                          uploadingSectionId === sec.id
                            ? "not-allowed"
                            : "pointer",
                        opacity: uploadingSectionId === sec.id ? 0.7 : 1,
                      }}
                    >
                      {uploadingSectionId === sec.id
                        ? "Subiendo..."
                        : "Subir imágenes"}

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        disabled={uploadingSectionId === sec.id}
                        onChange={async (e) => {
                          const files = e.currentTarget.files;
                          if (!files?.length) return;

                          await uploadPosters(sec.id, files);

                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {Array.isArray(sec.posterSrcs) && sec.posterSrcs.length > 0 ? (
                    <div className="poster-grid">
                      {sec.posterSrcs.map((src, posterIndex) => {
                        const deleteKey = `${sec.id}:${posterIndex}`;

                        return (
                          <div className="poster-card" key={deleteKey}>
                            <img
                              className="poster-img"
                              src={src}
                              alt={`${sec.title} ${posterIndex + 1}`}
                            />

                            <div className="poster-card-actions">
                              <button
                                className="btn btn-danger-soft"
                                onClick={() =>
                                  deletePoster(sec.id, posterIndex)
                                }
                                disabled={deletingPosterKey === deleteKey}
                                style={{ width: "100%" }}
                              >
                                {deletingPosterKey === deleteKey
                                  ? "Borrando..."
                                  : "Eliminar imagen"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-poster">
                      Esta sección todavía no tiene posters guardados en Mongo.
                    </div>
                  )}
                </div>

                <div className="items-head">
                  <div>Nombre</div>
                  <div>Descripción opcional</div>
                  <div>
                    Precio <span className="required">*</span>
                  </div>
                  <div></div>
                </div>

                {sec.items.map((it, ii) => (
                  <div className="item-row" key={`${sec.id}_${ii}`}>
                    <div className="field">
                      <label className="mobile-label">Nombre</label>

                      <input
                        className="input"
                        value={it.name ?? ""}
                        onChange={(e) =>
                          changeItem(si, ii, { name: e.target.value })
                        }
                        placeholder="Nombre…"
                      />
                    </div>

                    <div className="field">
                      <label className="mobile-label">Descripción</label>

                      <input
                        className="input"
                        value={it.desc ?? ""}
                        onChange={(e) =>
                          changeItem(si, ii, { desc: e.target.value })
                        }
                        placeholder="Descripción…"
                      />
                    </div>

                    <div className="field">
                      <label className="mobile-label">Precio</label>

                      <input
                        className="input"
                        type="text"
                        value={it.price ?? ""}
                        onChange={(e) =>
                          changeItem(si, ii, { price: e.target.value })
                        }
                        placeholder="14900 o 14900/15700"
                      />
                    </div>

                    <button
                      className="btn btn-danger-soft"
                      onClick={() => removeItem(si, ii)}
                      disabled={isSavingAny}
                    >
                      Borrar
                    </button>
                  </div>
                ))}

                <div className="section-footer">
                  <button
                    className="btn btn-info-soft"
                    onClick={() => addItem(si)}
                    disabled={isSavingAny}
                  >
                    + Agregar ítem
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={() => saveSection(sec.id)}
                    disabled={isSavingAny || !sections}
                  >
                    {sectionIsSaving ? "Guardando..." : "Guardar sección"}
                  </button>
                </div>
              </div>
            );
          })}

        <div className="bottom-save">
          <div className="bottom-save-inner">
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={!sections || isSavingAny}
            >
              {saving ? "Guardando..." : "Guardar todo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}