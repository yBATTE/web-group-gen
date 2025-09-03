// lib/menu-types.ts
export type MenuItem = { name: string; desc?: string; price: string }

export type MenuSection = {
  id: string;
  title: string;
  chunkSize?: number;   // 👈 nuevo
  items: { name: string; desc?: string; price: string }[];
};

export type MenuDoc = {
  _id: "menu"
  sections: MenuSection[]
  updatedAt?: string
}
