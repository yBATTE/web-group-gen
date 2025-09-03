import mongoose, { Schema, model, models } from "mongoose";

const MenuItemSchema = new Schema(
  {
    name: { type: String, required: true },
    desc: { type: String },
    price: { type: String, required: true },
  },
  { _id: false }
);

const MenuSectionSchema = new Schema(
  {
    // id legible (ej: "cafeteria", "hamburguesas")
    sectionId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    items: { type: [MenuItemSchema], default: [] },

    // opcional (si usás posters por sección):
    posterSrcs: { type: [String], default: [] },
    chunkSize: { type: Number, default: 3 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type MenuItemDoc = {
  name: string;
  desc?: string;
  price: string;
};

export type MenuSectionDoc = {
  sectionId: string;
  title: string;
  items: MenuItemDoc[];
  posterSrcs?: string[];
  chunkSize?: number;
  order?: number;
};

export default models.MenuSection ||
  model("MenuSection", MenuSectionSchema);
