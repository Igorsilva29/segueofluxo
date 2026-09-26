import { createServerFn } from "@tanstack/react-start";

const TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; fans: number }>();

function parseDeezerArtistId(url: string): string | null {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/artist\/(\d+)/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

async function fetchFansFromApi(deezerUrl: string): Promise<number | null> {
  const id = parseDeezerArtistId(deezerUrl);
  if (!id) return null;

  const res = await fetch(`https://api.deezer.com/artist/${id}`);
  if (!res.ok) {
    console.warn("[deezer] artist", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as { nb_fan?: number; error?: unknown };
  if (data.error) {
    console.warn("[deezer] error", data.error);
    return null;
  }

  const n = Number(data.nb_fan);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function getDeezerFansCached(deezerUrl: string): Promise<number | null> {
  const now = Date.now();
  const hit = cache.get(deezerUrl);
  if (hit && hit.expiresAt > now) return hit.fans;

  const fans = await fetchFansFromApi(deezerUrl);
  if (fans != null) {
    cache.set(deezerUrl, { fans, expiresAt: now + TTL_MS });
  }
  return fans;
}

export const fetchDeezerFans = createServerFn({ method: "GET" })
  .validator((d: { deezerUrl: string }) => d)
  .handler(async ({ data }) => {
    if (!data.deezerUrl?.trim()) return null;
    return getDeezerFansCached(data.deezerUrl.trim());
  });