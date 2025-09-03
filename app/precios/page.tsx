"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import type { MenuSection, MenuItem } from "@/lib/menu-types";

type ApiDoc = {
  _id: "menu";
  sections: MenuSection[];
  updatedAt?: string;
};

/* ---------------- utils ---------------- */
const uid = () =>
  `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const toNumber = (v: unknown, def = 3) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const onlyDigits = (v: unknown) => String(v ?? "").replace(/[^\d]/g, "");
const formatPrice = (v: unknown) => {
  const d = onlyDigits(v);
  if (!d) return "";
  return "$ " + new Intl.NumberFormat("es-AR").format(Number(d));
};

const EMPTY_ITEM: MenuItem = { name: "", desc: "", price: "" };
const EMPTY_SECTION = (): MenuSection => ({
  id: uid(),
  title: "",
  chunkSize: 3,
  items: [],
});

/* ========================================================= */
export default function PreciosPage() {
  // protege la página
  const { status } = useSession({ required: true });

  const [sections, setSections] = useState<MenuSection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* -------- carga del menú -------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/menu", { cache: "no-store" });
        const json: ApiDoc | null = await res.json();
        if (!res.ok) throw new Error((json as any)?.error || res.statusText);

        const loaded = Array.isArray(json?.sections) ? json!.sections : [];
        const normalized: MenuSection[] = loaded.map((s) => ({
          id: s.id || uid(),
          title: s.title || "",
          chunkSize: toNumber((s as any).chunkSize, 3),
          items: Array.isArray(s.items)
            ? s.items.map((it) => ({
                name: it.name || "",
                desc: it.desc || "",
                price: onlyDigits(it.price), // normalizo a dígitos
              }))
            : [],
        }));
        setSections(normalized);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Error al cargar el menú");
      }
    };
    load();
  }, []);

  /* -------- handlers de edición -------- */
  const changeSec = (idx: number, patch: Partial<MenuSection>) => {
    setSections((prev) => {
      if (!prev) return prev;
      const next = prev.map((s) => ({ ...s }));
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
      }));
      next[si].items[ii] = { ...next[si].items[ii], ...patch };
      return next;
    });
  };

  const addSection = () => {
    setSections((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      return [...base, EMPTY_SECTION()];
    });
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
      }));
      next[si].items.push({ ...EMPTY_ITEM });
      return next;
    });
  };

  const removeItem = (si: number, ii: number) => {
    setSections((prev) => {
      if (!prev) return prev;
      const next = prev.map((s) => ({ ...s, items: s.items.slice() }));
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

  /* -------- guardar con validación -------- */
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
            price: it.price || "", // 👈 se guarda tal cual, sin validar
          })),
        })),
      };

      const res = await fetch("/api/menu", {
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

  /* -------- UI -------- */
  if (status === "loading") return <p style={{ padding: 16 }}>Autenticando…</p>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1>Editar precios</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={addSection}
            style={{
              background: "#10b981",
              color: "white",
              borderRadius: 8,
              padding: "8px 12px",
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
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: "crimson", marginTop: 8 }}>Error: {error}</p>
      )}
      {!error && sections === null && (
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
                    style={{ display: "block", fontSize: 12, color: "#6b7280" }}
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
                    style={{ display: "block", fontSize: 12, color: "#6b7280" }}
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
                    style={{ display: "block", fontSize: 12, color: "#6b7280" }}
                  >
                    chunkSize
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={Number(sec.chunkSize ?? 3)}
                    onChange={(e) =>
                      changeSec(si, { chunkSize: toNumber(e.target.value, 3) })
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
                    title="Subir sección"
                    style={{
                      background: si === 0 ? "#e5e7eb" : "#f3f4f6",
                      color: "#111827",
                      borderRadius: 10,
                      padding: "10px 12px",
                      cursor: si === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    ↑
                  </button>

                  <button
                    onClick={() => moveSection(si, si + 1)}
                    disabled={sections ? si === sections.length - 1 : true}
                    title="Bajar sección"
                    style={{
                      background:
                        sections && si === sections.length - 1
                          ? "#e5e7eb"
                          : "#f3f4f6",
                      color: "#111827",
                      borderRadius: 10,
                      padding: "10px 12px",
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
                    }}
                  >
                    Eliminar sección
                  </button>
                </div>
              </div>

              {/* encabezados de tabla */}
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

              {/* items */}
              {sec.items.map((it, ii) => {
                const priceInvalid = !onlyDigits(it.price);

                return (
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
                      type="text" // 👈 queda en texto, no "number"
                      value={it.price ?? ""}
                      onChange={(e) =>
                        changeItem(si, ii, { price: e.target.value })
                      }
                      placeholder="$0.00"
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
                      }}
                    >
                      borrar
                    </button>
                  </div>
                );
              })}

              <div style={{ marginTop: 12 }}>
                <button
                  onClick={() => addItem(si)}
                  style={{
                    background: "#e0f2fe",
                    color: "#075985",
                    borderRadius: 10,
                    padding: "10px 12px",
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
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
