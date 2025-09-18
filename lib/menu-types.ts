// lib/menu-types.ts
export type MenuItem = { name: string; desc?: string; price: string };

export type MenuSection = {
  id: string;
  title: string;
  chunkSize?: number;
  items: { name: string; desc?: string; price: string }[];
};

/**
 * En prod guardamos un doc por estación:
 *   _id = `menu:<slug>`  (p.ej. "menu:catania-gen")
 * Para compatibilidad, aceptamos también el legado "_id: 'menu'".
 */
export type MenuDoc = {
  _id: `menu:${string}` | "menu";  // ⟵ clave: ya no es literal "menu" solamente
  station?: string;                // opcional (si querés guardarlo)
  sections: MenuSection[];
  updatedAt?: string;
};
