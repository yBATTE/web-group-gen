// lib/stations.ts
export const STATIONS = [
  { slug: "catania-gen", name: "CATANIA GEN" },
  { slug: "combustibles-canning", name: "COMBUSTIBLES CANNING" },
  { slug: "monteverde-sa", name: "MONTEVERDE SA" },
  { slug: "tobago-i", name: "TOBAGO I" },
  { slug: "tobago-ii", name: "TOBAGO II" },
  { slug: "bettica-sa", name: "BETTICA SA" },
] as const;
export type StationSlug = typeof STATIONS[number]["slug"];
