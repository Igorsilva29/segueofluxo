import { createServerFn } from "@tanstack/react-start";

const SUBSCRIBERS_TTL_MS = 24 * 60 * 60 * 1000;
const TOP_VIDEOS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const subscribersCache = new Map<string, { expiresAt: number; count: number }>();
const topVideosCache = new Map<string, { expiresAt: number; videos: YoutubeTopVideo[] }>();

export type YoutubeTopVideo = {
  id: string;
  title: string;
  thumbnail: string;
  viewCount: number;
  publishedAt: string;
  url: string;
};

function readYoutubeApiKey(): string {
  return (
    process.env["YOUTUBE_API_KEY"] ??
    (import.meta.env["YOUTUBE_API_KEY"] as string | undefined) ??
    ""
  ).trim();
}

/** Extrai UC... de /channel/UCxxx ou @handle de youtube.com/@handle */
function parseYoutubeTarget(
  url: string,
): { type: "id"; id: string } | { type: "handle"; handle: string } | null {
  try {
    const u = new URL(url);
    const channelMatch = u.pathname.match(/\/channel\/(UC[\w-]+)/i);
    if (channelMatch?.[1]) return { type: "id", id: channelMatch[1] };

    const handleMatch = u.pathname.match(/\/@([\w.-]+)/i);
    if (handleMatch?.[1]) return { type: "handle", handle: handleMatch[1] };

    return null;
  } catch {
    return null;
  }
}

async function resolveChannelId(youtubeUrl: string, key: string): Promise<string | null> {
  const target = parseYoutubeTarget(youtubeUrl);
  if (!target) return null;
  if (target.type === "id") return target.id;

  const params = new URLSearchParams({
    part: "id",
    forHandle: target.handle,
    key,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?${params}`);
  if (!res.ok) {
    console.warn("[youtube] channel resolve", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { items?: { id?: string }[] };
  return data.items?.[0]?.id ?? null;
}

async function fetchSubscriberCountFromApi(youtubeUrl: string): Promise<number | null> {
  const key = readYoutubeApiKey();
  if (!key) return null;

  const target = parseYoutubeTarget(youtubeUrl);
  if (!target) return null;

  const params = new URLSearchParams({
    part: "statistics",
    key,
  });
  if (target.type === "id") params.set("id", target.id);
  else params.set("forHandle", target.handle);

  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?${params}`);
  if (!res.ok) {
    console.warn("[youtube] API", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    items?: { statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean } }[];
  };
  const stats = data.items?.[0]?.statistics;
  if (!stats || stats.hiddenSubscriberCount) return null;

  const n = Number(stats.subscriberCount);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function getYoutubeSubscribersCached(youtubeUrl: string): Promise<number | null> {
  const now = Date.now();
  const hit = subscribersCache.get(youtubeUrl);
  if (hit && hit.expiresAt > now) return hit.count;

  const count = await fetchSubscriberCountFromApi(youtubeUrl);
  if (count != null) {
    subscribersCache.set(youtubeUrl, { count, expiresAt: now + SUBSCRIBERS_TTL_MS });
  }
  return count;
}

async function fetchTopVideosFromApi(
  youtubeUrl: string,
  limit: number,
): Promise<YoutubeTopVideo[]> {
  const key = readYoutubeApiKey();
  if (!key) return [];

  const channelId = await resolveChannelId(youtubeUrl, key);
  if (!channelId) return [];

  const searchParams = new URLSearchParams({
    part: "snippet",
    channelId,
    order: "viewCount",
    type: "video",
    maxResults: String(Math.min(Math.max(limit, 1), 10)),
    key,
  });
  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${searchParams}`,
  );
  if (!searchRes.ok) {
    console.warn("[youtube] search", searchRes.status, await searchRes.text());
    return [];
  }

  const searchData = (await searchRes.json()) as {
    items?: {
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        publishedAt?: string;
        thumbnails?: { medium?: { url?: string }; high?: { url?: string } };
      };
    }[];
  };

  const searchItems = (searchData.items ?? []).filter((item) => item.id?.videoId);
  if (searchItems.length === 0) return [];

  const ids = searchItems.map((item) => item.id!.videoId!).join(",");
  const videosParams = new URLSearchParams({
    part: "snippet,statistics",
    id: ids,
    key,
  });
  const videosRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${videosParams}`,
  );
  if (!videosRes.ok) {
    console.warn("[youtube] videos", videosRes.status, await videosRes.text());
    // fallback: search snippet only, sem viewCount
    return searchItems.map((item) => {
      const id = item.id!.videoId!;
      const sn = item.snippet;
      return {
        id,
        title: sn?.title ?? "Vídeo",
        thumbnail: sn?.thumbnails?.high?.url ?? sn?.thumbnails?.medium?.url ?? "",
        viewCount: 0,
        publishedAt: sn?.publishedAt ?? "",
        url: `https://www.youtube.com/watch?v=${id}`,
      };
    });
  }

  const videosData = (await videosRes.json()) as {
    items?: {
      id?: string;
      snippet?: {
        title?: string;
        publishedAt?: string;
        thumbnails?: { medium?: { url?: string }; high?: { url?: string } };
      };
      statistics?: { viewCount?: string };
    }[];
  };

  return (videosData.items ?? [])
    .filter((item) => item.id)
    .map((item) => {
      const id = item.id!;
      const sn = item.snippet;
      const views = Number(item.statistics?.viewCount);
      return {
        id,
        title: sn?.title ?? "Vídeo",
        thumbnail: sn?.thumbnails?.high?.url ?? sn?.thumbnails?.medium?.url ?? "",
        viewCount: Number.isFinite(views) ? views : 0,
        publishedAt: sn?.publishedAt ?? "",
        url: `https://www.youtube.com/watch?v=${id}`,
      };
    })
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

async function getTopYoutubeVideosCached(
  youtubeUrl: string,
  limit: number,
): Promise<YoutubeTopVideo[]> {
  const cacheKey = `${youtubeUrl}|${limit}`;
  const now = Date.now();
  const hit = topVideosCache.get(cacheKey);
  if (hit && hit.expiresAt > now) return hit.videos;

  const videos = await fetchTopVideosFromApi(youtubeUrl, limit);
  if (videos.length > 0) {
    topVideosCache.set(cacheKey, { videos, expiresAt: now + TOP_VIDEOS_TTL_MS });
  }
  return videos;
}

/** Só no servidor — a API key não vai pro browser. */
export const fetchYoutubeSubscribers = createServerFn({ method: "GET" })
  .validator((d: { youtubeUrl: string }) => d)
  .handler(async ({ data }) => {
    if (!data.youtubeUrl?.trim()) return null;
    return getYoutubeSubscribersCached(data.youtubeUrl.trim());
  });

export const fetchTopYoutubeVideos = createServerFn({ method: "GET" })
  .validator((d: { youtubeUrl: string; limit?: number }) => d)
  .handler(async ({ data }) => {
    if (!data.youtubeUrl?.trim()) return [];
    return getTopYoutubeVideosCached(data.youtubeUrl.trim(), data.limit ?? 5);
  });
