// lib/menu-types.ts
export type MenuItem = {
  name: string;
  desc?: string;
  price: string;
};

export type MenuSection = {
  id: string;
  title: string;
  chunkSize?: number;
  items: MenuItem[];

  // posters subidos a Cloudinary y guardados en Mongo
  posterSrcs?: string[];
  posterPublicIds?: string[];
};

/**
 * En prod guardamos un doc por estación:
 *   _id = `menu:<slug>`  (p.ej. "menu:catania-gen")
 * Para compatibilidad, aceptamos también el legado "_id: 'menu'".
 */
export type MenuDoc = {
  _id: `menu:${string}` | "menu";
  station?: string;
  sections: MenuSection[];
  updatedAt?: string;
};