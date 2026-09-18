import { createServerFn } from "@tanstack/react-start";
import type { Post } from "@/data/mockData";
import { getMostViewedPosts } from "@/data/wordpress";

const TTL_MS = 60 * 60 * 1000; // 1 hora

type Cache = { expiresAt: number; data: Post[] };

let cache: Cache | null = null;
let inflight: Promise<Post[]> | null = null;

async function getMostViewedPostsCached(limit = 5): Promise<Post[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.data;
  }

  if (inflight) return inflight;

  inflight = getMostViewedPosts(limit)
    .then((data) => {
      cache = { data, expiresAt: Date.now() + TTL_MS };
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/** Só no servidor — o token do Stats não existe no browser. */
export const fetchMostViewedPosts = createServerFn({ method: "GET" }).handler(
  async () => getMostViewedPostsCached(5),
);
