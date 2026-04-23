// lib/menu-users.ts
import { STATIONS, type StationSlug } from "@/lib/stations";

export type MenuEditor = {
  id: string;
  username: string;
  password: string;
  name: string;
  station: StationSlug;
};

const STATION_SET = new Set(STATIONS.map((s) => s.slug));

function isValidStation(value: unknown): value is StationSlug {
  return typeof value === "string" && STATION_SET.has(value as StationSlug);
}

function safeParseUsers(): MenuEditor[] {
  try {
    const raw = process.env.MENU_USERS_JSON;
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((u: any) => ({
        id: String(u?.id ?? ""),
        username: String(u?.username ?? "").trim(),
        password: String(u?.password ?? ""),
        name: String(u?.name ?? ""),
        station: String(u?.station ?? ""),
      }))
      .filter(
        (u): u is MenuEditor =>
          !!u.id &&
          !!u.username &&
          !!u.password &&
          !!u.name &&
          isValidStation(u.station)
      );
  } catch {
    return [];
  }
}

export const MENU_USERS: MenuEditor[] = safeParseUsers();

export function findMenuUser(username?: string, password?: string) {
  if (!username || !password) return null;

  return (
    MENU_USERS.find(
      (u) =>
        u.username === username.trim() &&
        u.password === password
    ) ?? null
  );
}