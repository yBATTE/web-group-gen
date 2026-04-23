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

export default function PreciosPage() {
  const { data: session, status } = useSession({ required: true });

  const station = (session?.user as any)?.station as StationSlug | undefined;

  const [sections, setSections] = useState<MenuSection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null);
  const [deletingPosterKey, setDeletingPosterKey] = useState<string | null>(null);

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

  const save = async () => {
    if (!sections) return;
    setSaving(true);

    try {
      const payload = {
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

      const res = await fetch(`/api/menu`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || res.statusText);

      alert("¡Cambios guardados!");
    } catch (e: any) {
      alert(`Error al guardar: ${e?.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return <p style={{ padding: 16 }}>Autenticando…</p>;
  }

  return (
    <div className="light-scope" style={{ minHeight: "100dvh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <h1>Editar precios</h1>
            <p style={{ marginTop: 4, color: "#6b7280" }}>
              Estación: <strong>{stationName}</strong>
            </p>
            <p style={{ marginTop: 4, color: "#6b7280", fontSize: 13 }}>
              Las imágenes se guardan apenas se suben. El botón guardar sigue siendo
              para títulos, items y precios.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={addSection}
              style={{
                background: "#10b981",
                color: "white",
                borderRadius: 8,
                padding: "8px 12px",
                border: "none",
                cursor: "pointer",
              }}
            >
              + Agregar sección
            </button>

            <button
              onClick={() => signOut({ callbackUrl: "/precios/login" })}
              style={{
                background: "#ef4444",
                color: "white",
                borderRadius: 8,
                padding: "8px 12px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: "crimson", marginTop: 8 }}>Error: {error}</p>
        )}

        {!error && (loading || sections === null) && (
          <p style={{ marginTop: 8 }}>Cargando menú…</p>
        )}

        {Array.isArray(sections) &&
          sections.map((sec, si) => {
            const titleInvalid = !sec.title.trim();

            return (
              <div
                key={sec.id}
                style={{
                  marginTop: 28,
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 280px 160px auto",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      Título de la sección{" "}
                      <span style={{ color: "#dc2626" }}>*</span>
                    </label>

                    <input
                      value={sec.title ?? ""}
                      onChange={(e) => changeSec(si, { title: e.target.value })}
                      placeholder="Ej: Hamburguesas"
                      style={{
                        width: "100%",
                        padding: 10,
                        border: `1px solid ${
                          titleInvalid ? "#ef4444" : "#d1d5db"
                        }`,
                        borderRadius: 10,
                        background: titleInvalid ? "#fef2f2" : "white",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      ID (solo lectura)
                    </label>

                    <input
                      value={sec.id ?? ""}
                      readOnly
                      style={{
                        width: "100%",
                        padding: 10,
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                        borderRadius: 10,
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      chunkSize
                    </label>

                    <input
                      type="number"
                      min={1}
                      value={Number(sec.chunkSize ?? 3)}
                      onChange={(e) =>
                        changeSec(si, {
                          chunkSize: toNumber(e.target.value, 3),
                        })
                      }
                      style={{
                        width: "100%",
                        padding: 10,
                        border: "1px solid #d1d5db",
                        borderRadius: 10,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      alignSelf: "end",
                      textAlign: "right",
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <button
                      onClick={() => moveSection(si, si - 1)}
                      disabled={si === 0}
                      style={{
                        background: si === 0 ? "#e5e7eb" : "#f3f4f6",
                        color: "#111827",
                        borderRadius: 10,
                        padding: "10px 12px",
                        border: "none",
                        cursor: si === 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      ↑
                    </button>

                    <button
                      onClick={() => moveSection(si, si + 1)}
                      disabled={sections ? si === sections.length - 1 : true}
                      style={{
                        background:
                          sections && si === sections.length - 1
                            ? "#e5e7eb"
                            : "#f3f4f6",
                        color: "#111827",
                        borderRadius: 10,
                        padding: "10px 12px",
                        border: "none",
                        cursor:
                          sections && si === sections.length - 1
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      ↓
                    </button>

                    <button
                      onClick={() => removeSection(si)}
                      style={{
                        background: "#f3f4f6",
                        color: "#111827",
                        borderRadius: 10,
                        padding: "10px 12px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Eliminar sección
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>Posters de la sección</div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        Si no cargás nada en Mongo, después en la parte pública podés
                        seguir usando fallback local.
                      </div>
                    </div>

                    <label
                      style={{
                        background: "#111827",
                        color: "white",
                        borderRadius: 10,
                        padding: "10px 12px",
                        cursor:
                          uploadingSectionId === sec.id ? "not-allowed" : "pointer",
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
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      {sec.posterSrcs.map((src, posterIndex) => {
                        const deleteKey = `${sec.id}:${posterIndex}`;
                        return (
                          <div
                            key={deleteKey}
                            style={{
                              border: "1px solid #e5e7eb",
                              borderRadius: 12,
                              overflow: "hidden",
                              background: "white",
                            }}
                          >
                            <img
                              src={src}
                              alt={`${sec.title} ${posterIndex + 1}`}
                              style={{
                                width: "100%",
                                height: 180,
                                objectFit: "cover",
                                display: "block",
                              }}
                            />

                            <div style={{ padding: 10 }}>
                              <button
                                onClick={() => deletePoster(sec.id, posterIndex)}
                                disabled={deletingPosterKey === deleteKey}
                                style={{
                                  width: "100%",
                                  background: "#fee2e2",
                                  color: "#b91c1c",
                                  borderRadius: 10,
                                  padding: "10px 12px",
                                  border: "none",
                                  cursor:
                                    deletingPosterKey === deleteKey
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity:
                                    deletingPosterKey === deleteKey ? 0.7 : 1,
                                }}
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
                    <div
                      style={{
                        marginBottom: 8,
                        border: "1px dashed #d1d5db",
                        borderRadius: 12,
                        padding: 14,
                        color: "#6b7280",
                        background: "#fafafa",
                      }}
                    >
                      Esta sección todavía no tiene posters guardados en Mongo.
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1.4fr 0.6fr 96px",
                    gap: 12,
                    marginTop: 16,
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  <div>Nombre</div>
                  <div>Descripción (opcional)</div>
                  <div>
                    Precio <span style={{ color: "#dc2626" }}>*</span>
                  </div>
                  <div></div>
                </div>

                {sec.items.map((it, ii) => (
                  <div
                    key={`${sec.id}_${ii}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 1.4fr 0.6fr 96px",
                      gap: 12,
                      marginTop: 10,
                    }}
                  >
                    <input
                      value={it.name ?? ""}
                      onChange={(e) =>
                        changeItem(si, ii, { name: e.target.value })
                      }
                      placeholder="Nombre…"
                      style={{
                        width: "100%",
                        padding: 10,
                        border: "1px solid #d1d5db",
                        borderRadius: 10,
                      }}
                    />

                    <input
                      value={it.desc ?? ""}
                      onChange={(e) =>
                        changeItem(si, ii, { desc: e.target.value })
                      }
                      placeholder="Descripción…"
                      style={{
                        width: "100%",
                        padding: 10,
                        border: "1px solid #d1d5db",
                        borderRadius: 10,
                      }}
                    />

                    <input
                      type="text"
                      value={it.price ?? ""}
                      onChange={(e) =>
                        changeItem(si, ii, { price: e.target.value })
                      }
                      placeholder="14900 o 14900/15700"
                      style={{
                        width: "100%",
                        padding: 10,
                        border: "1px solid #d1d5db",
                        borderRadius: 10,
                      }}
                    />

                    <button
                      onClick={() => removeItem(si, ii)}
                      style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        borderRadius: 10,
                        padding: "10px 12px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      borrar
                    </button>
                  </div>
                ))}

                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={() => addItem(si)}
                    style={{
                      background: "#e0f2fe",
                      color: "#075985",
                      borderRadius: 10,
                      padding: "10px 12px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    + Agregar ítem
                  </button>
                </div>
              </div>
            );
          })}

        <div style={{ marginTop: 24 }}>
          <button
            onClick={save}
            disabled={!sections || saving}
            style={{
              background: "#2563eb",
              color: "white",
              borderRadius: 10,
              padding: "12px 16px",
              border: "none",
              cursor: saving ? "wait" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}