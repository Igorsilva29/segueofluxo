import type { Artist, Post, PostBlock } from "@/data/mockData";

const WP = import.meta.env["VITE_WP_URL"] as string;

function decodeEntities(text: string): string {
    return text
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&");
}

function stripHtml(html: string): string {
    return decodeEntities(html.replace(/<[^>]+>/g, "")).trim();
}

function imageUrls(html: string): string[] {
    const urls: string[] = [];
    const re = /<img[^>]+src="([^"]+)"/gi;
    let match: RegExpExecArray | null;
    while ((match = re.exec(html))) {
        const src = decodeEntities(match[1] ?? "");
        if (src) urls.push(src);
    }
    return urls;
}

function blocksFromHtml(html: string): PostBlock[] {
    const blocks: PostBlock[] = [];
    const re =
        /<(p|h2|h3|blockquote)[^>]*>([\s\S]*?)<\/\1>|<(?:figure)[^>]*>[\s\S]*?<\/figure>|<iframe[^>]+src="[^"]*(?:youtu|spotify\.com)[^"]*"[^>]*>(?:[\s\S]*?<\/iframe>)?/gi;
    let match: RegExpExecArray | null;

    while ((match = re.exec(html))) {
        if (match[1]) {
            const inner = match[2] ?? "";
            const igInText = instagramFrom(inner);
            const tag = match[1].toLowerCase();
            const text = stripHtml(inner);
            const spotifyInText = spotifyFrom(inner);
            if (spotifyInText) {
                blocks.push({
                    type: "spotify",
                    kind: spotifyInText.kind,
                    id: spotifyInText.id,
                });
                continue;
            }

            if (igInText) {
                const firstP = inner.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
                const quoteText = stripHtml(
                    firstP?.[1] ?? inner.split(/<(?:figure|blockquote)/i)[0] ?? "",
                ).trim();
                if (quoteText) {
                    blocks.push(
                        tag === "blockquote"
                            ? { type: "quote", text: quoteText }
                            : { type: "paragraph", text: quoteText },
                    );
                }
                blocks.push({ type: "instagram", url: igInText, caption: "" });
                continue;
            }
            if (!text) continue;
            if (tag === "h2" || tag === "h3") blocks.push({ type: "heading", text });
            else if (tag === "blockquote") blocks.push({ type: "quote", text });
            else blocks.push({ type: "paragraph", text });
            continue;
        }

        const video = youtubeId(match[1] ? (match[2] ?? "") : match[0]);
        if (video) {
            blocks.push({ type: "youtube", id: video, title: "Youtube" });
            continue;
        }

        const spotify = spotifyFrom(match[0]);
        if (spotify) {
            blocks.push({ type: "spotify", kind: spotify.kind, id: spotify.id });
            continue;
        }

        const ig = instagramFrom(match[0]);
        if (ig) {
            blocks.push({ type: "instagram", url: ig, caption: "" });
            continue;
        }

        const urls = imageUrls(match[0]);
        if (urls.length === 0) continue;
        const last = blocks[blocks.length - 1];
        if (last?.type === "gallery") last.urls.push(...urls);
        else blocks.push({ type: "gallery", urls });
    }

    if (blocks.length === 0) {
        const fallback = stripHtml(html);
        if (fallback) blocks.push({ type: "paragraph", text: fallback });
    }

    return blocks;
}

function youtubeId(html: string): string | undefined {
    const match = html.match(
        /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    return match?.[1];
}

function instagramFrom(html: string): string | undefined {
    const match = html.match(
        /instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/i,
    );
    if (!match) return undefined;
    return `https://www.instagram.com/${match[1]}/${match[2]}/`;
}

function spotifyFrom(html: string):
    | { kind: "album" | "track" | "playlist" | "episode" | "show" | "artist"; id:string }
    | undefined {
        const match = html.match(
            /open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(?:embed\/)?(album|track|playlist|episode|show|artist)\/([a-zA-z0-9]+)/i,
        );
        if (!match?.[1] || !match[2]) return undefined;
        return {
            kind: match[1]?.toLowerCase() as "album" | "track" | "playlist" | "episode" | "show" | "artist",
            id: match[2],
        };
    }

function categoryFromPost(wp: {
    _embedded?: { "wp:term"? : { name: string; slug: string }[][] };
}): string {
    const terms = wp._embedded?.["wp:term"]?.[0] ?? [];
    const real = terms.find(
        (t) => t.slug !== "uncategorized" && t.name.toLowerCase() !== "uncategorized",
    );
    return real?.name ?? terms[0]?.name ?? "Sem categoria";
}

function readingTimeFrom(text: string): number {
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

let artistIdToSlugCache: Map<number, string> | null = null;

async function getArtistIdToSlug(): Promise<Map<number, string>> {
    if (artistIdToSlugCache) return artistIdToSlugCache;
    const res = await fetch(`${WP}/artista?per_page=100&_fields=id,slug`);
    if (!res.ok) {
        artistIdToSlugCache = new Map();
        return artistIdToSlugCache;
    }
    const data = (await res.json()) as { id: number; slug: string }[];
    artistIdToSlugCache = new Map(data.map((a) => [a.id, a.slug]));
    return artistIdToSlugCache;
}

function artistSlugsFromAcf(
    acf: unknown,
    idToSlug: Map<number, string>,
): string[] {
    if (!acf || typeof acf !== "object" || Array.isArray(acf)) return [];
    const raw = (acf as { artistas?: unknown }).artistas;
    if (!Array.isArray(raw)) return [];

    return raw
        .map((item) => {
            if (typeof item === "number") return idToSlug.get(item) ?? "";
            if (typeof item === "string" && /^\d+$/.test(item)) {
                return idToSlug.get(Number(item)) ?? "";
            }
            if (typeof item === "object" && item && "slug" in item) {
                return String((item as { slug: string }).slug);
            }
            return "";
        })
        .filter(Boolean);
}

function mapPost(
    wp: {
        id: number;
        slug: string;
        date: string;
        title: { rendered: string };
        excerpt: { rendered: string };
        content: { rendered: string };
        jetpack_featured_media_url?: string;
        acf?: unknown;
        _embedded?: {
            author?: { name: string }[];
            "wp:featuredmedia"?: { source_url: string }[];
            "wp:term"?: { name: string; slug: string }[][];
        };
    },
    idToSlug: Map<number, string> = new Map(),
): Post {
    const title = stripHtml(wp.title.rendered);
    const content = blocksFromHtml(wp.content.rendered);
    const body = content
        .map((b) => ("text" in b ? b.text : ""))
        .join(" ");
    const skipTags = new Set(["carrossel", "lateral", "mais-vistas"]);
    const city = wp._embedded?.["wp:term"]?.[1]?.find((t) => {
        const slug = t.slug.toLowerCase();
        const name = t.name.toLowerCase();
        return !skipTags.has(slug) && !skipTags.has(name);
    })?.name;
    const cover =
        wp._embedded?.["wp:featuredmedia"]?.[0]?.source_url ??
        wp.jetpack_featured_media_url ??
        "";

    return {
        id: wp.id,
        slug: wp.slug,
        title,
        excerpt: stripHtml(wp.excerpt.rendered) || body.slice(0, 160),
        category: categoryFromPost(wp),
        cover,
        author: wp._embedded?.author?.[0]?.name ?? "Redação Segue o Fluxo",
        date: wp.date,
        readingTime: readingTimeFrom(body),
        ...(city ? { city } : {}),
        artistSlugs: artistSlugsFromAcf(wp.acf, idToSlug),
        content,
    };
}

export async function getPosts(category?: string): Promise<Post[]> {
    const [res, idToSlug] = await Promise.all([
        fetch(`${WP}/posts?_embed&per_page=20`),
        getArtistIdToSlug(),
    ]);
    if (!res.ok) throw new Error(`WordPress ${res.status}`);
    const data = (await res.json()) as Parameters<typeof mapPost>[0][];
    const posts = data.map((p) => mapPost(p, idToSlug));
    if (!category || category === "Últimas") return posts;
    return posts.filter((p) => p.category === category);
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
    const [res, idToSlug] = await Promise.all([
        fetch(`${WP}/posts?slug=${slug}&_embed`),
        getArtistIdToSlug(),
    ]);
    if (!res.ok) throw new Error(`WordPress ${res.status}`);
    const data = (await res.json()) as Parameters<typeof mapPost>[0][];
    return data[0] ? mapPost(data[0], idToSlug) : undefined;
}

export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
    const all = await getPosts();
    return all
        .filter((p) => p.id !== post.id)
        .sort((a, b) => (a.category === post.category ? -1 : 1))
        .slice(0, limit);
}

export async function getCategories(): Promise<string[]> {
    const res = await fetch(`${WP}/categories?per_page=100`);
    if (!res.ok) throw new Error(`WordPress ${res.status}`);
    const data = (await res.json()) as { name: string; slug: string; count: number }[];
    return data
        .filter((c) => c.slug !== "uncategorized" && c.count > 0)
        .map((c) => c.name);
}

export async function searchPosts(q: string): Promise<Post[]> {
    const query = q.trim();
    if (query.length < 2) return [];
    const [res, idToSlug] = await Promise.all([
        fetch(
            `${WP}/posts?search=${encodeURIComponent(query)}&_embed&per_page=5`,
        ),
        getArtistIdToSlug(),
    ]);
    if (!res.ok) throw new Error(`WordPress ${res.status}`);
    const data = (await res.json()) as Parameters<typeof mapPost>[0][];
    return data.map((p) => mapPost(p, idToSlug));
}

async function getPostsByTagSlug(slug: string, perPage = 3): Promise<Post[]> {
    const tagRes = await fetch(`${WP}/tags?slug=${slug}`);
    if (!tagRes.ok) throw new Error(`WordPress ${tagRes.status}`);
    const tags = (await tagRes.json()) as { id: number }[];
    const id = tags[0]?.id;
    if (!id) return [];

    const [res, idToSlug] = await Promise.all([
        fetch(`${WP}/posts?tags=${id}&_embed&per_page=${perPage}`),
        getArtistIdToSlug(),
    ]);
    if (!res.ok) throw new Error(`WordPress ${res.status}`);
    const data = (await res.json()) as Parameters<typeof mapPost>[0][];
    return data.map((p) => mapPost(p, idToSlug));
}

export function getCarouselPosts() {
    return getPostsByTagSlug("carrossel", 3);
}

export function getSidebarPosts() {
    return getPostsByTagSlug("lateral", 3);
}

type TopPostRow = {
    id: number;
    title: string;
    views?: number;
};

function decodeBase64(value: string): string {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    if (typeof atob === "function") {
        return atob(normalized);
    }
    const Buf = (globalThis as { Buffer?: { from: (s: string, enc: string) => { toString: (e: string) => string } } }).Buffer;
    if (Buf) return Buf.from(normalized, "base64").toString("utf8");
    throw new Error("Sem decoder base64");
}

/** Tokens do WP.com têm # e $ — no .env isso quebra. Prefira WPCOM_STATS_TOKEN_B64. */
function readStatsToken(): string {
    const rawB64 = (
        process.env["WPCOM_STATS_TOKEN_B64"] ??
        (import.meta.env["WPCOM_STATS_TOKEN_B64"] as string | undefined) ??
        ""
    )
        .trim()
        .replace(/^["']|["']$/g, "");

    if (rawB64) {
        try {
            return decodeBase64(rawB64).trim();
        } catch (e) {
            console.warn("[mostViewed] WPCOM_STATS_TOKEN_B64 inválido", e);
        }
    }

    return (
        process.env["WPCOM_STATS_TOKEN"] ??
        (import.meta.env["WPCOM_STATS_TOKEN"] as string | undefined) ??
        ""
    )
        .trim()
        .replace(/^["']|["']$/g, "");
}

export async function getMostViewedPosts(limit = 5): Promise<Post[]> {
    try {
        const token = readStatsToken();
        const blogId = (
            process.env["WPCOM_BLOG_ID"] ??
            (import.meta.env["WPCOM_BLOG_ID"] as string | undefined) ??
            "257060611"
        )
            .trim()
            .replace(/^["']|["']$/g, "");

        if (!token) {
            console.warn("[mostViewed] token ausente — usando tag mais-vistas");
            return getPostsByTagSlug("mais-vistas", limit);
        }

        console.warn("[mostViewed] token ok, len", token.length);

        const url =
            `https://public-api.wordpress.com/rest/v1.1/sites/${encodeURIComponent(blogId)}/stats/top-posts` +
            `?period=day&num=30&max=${limit}`;

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            const errText = await res.text();
            console.warn(
                "[mostViewed] API",
                res.status,
                errText.slice(0, 200),
                `(token len ${token.length})`,
            );
            return getPostsByTagSlug("mais-vistas", limit);
        }

        const data = (await res.json()) as {
            summary?: TopPostRow[] | { postviews?: TopPostRow[] };
            days?:
                | { postviews?: TopPostRow[] }[]
                | Record<string, { postviews?: TopPostRow[] }>;
        };

        const dayList = Array.isArray(data.days)
            ? data.days
            : data.days
              ? Object.values(data.days)
              : [];

        const rows: TopPostRow[] = Array.isArray(data.summary)
            ? data.summary
            : (data.summary?.postviews ??
                dayList.flatMap((d) => d.postviews ?? []) ??
                []);

        const viewsById = new Map<number, number>();
        for (const row of rows) {
            const id = Number(row.id);
            if (!Number.isFinite(id) || id <= 0) continue;
            viewsById.set(id, (viewsById.get(id) ?? 0) + Number(row.views ?? 0));
        }

        const ids = [...viewsById.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([id]) => id)
            .slice(0, limit);

        console.warn("[mostViewed] rows", rows.length, "ids", ids);

        if (ids.length === 0) {
            return getPostsByTagSlug("mais-vistas", limit);
        }

        const idToSlug = await getArtistIdToSlug();
        const posts: Post[] = [];
        for (const id of ids) {
            const resPost = await fetch(`${WP}/posts/${id}?_embed`);
            if (!resPost.ok) continue;
            const wp = (await resPost.json()) as Parameters<typeof mapPost>[0];
            posts.push(mapPost(wp, idToSlug));
        }
        return posts.length > 0 ? posts : getPostsByTagSlug("mais-vistas", limit);
    } catch (e) {
        console.warn("[mostViewed] falhou, fallback tag", e);
        try {
            return await getPostsByTagSlug("mais-vistas", limit);
        } catch {
            return [];
        }
    }
}

type WpArtist = {
    id: number;
    slug: string;
    title: { rendered: string };
    content: { rendered: string };
    featured_media?: number;
    acf?: {
        role?: string;
        city?: string;
        bio?: string;
        whatsapp?: string;
        email?: string;
        instagram?: string;
        youtube?: string;
        spotify?: string;
        tiktok?: string;
        deezer?: string;
        youtube_subscribers?: number | string;
        cover?: string | number | { url?: string } | false | null;
    };
    _embedded?: {
        "wp:featuredmedia"?: { id?: number; source_url: string }[];
    };
};

async function resolveMediaUrl(
    value: string | number | { url?: string } | false | null | undefined,
    fallback: string,
): Promise<string> {
    if (!value) return fallback;
    if (typeof value === "string") {
        if (value.startsWith("http")) return value;
        return fallback;
    }
    if (typeof value === "object" && typeof value.url === "string" && value.url) {
        return value.url;
    }
    if (typeof value === "number" && value > 0) {
        try {
            const res = await fetch(`${WP}/media/${value}`);
            if (res.ok) {
                const media = (await res.json()) as { source_url?: string };
                if (media.source_url) return media.source_url;
            }
        } catch {
            /* ignore */
        }
    }
    return fallback;
}

async function mapArtist(wp: WpArtist): Promise<Artist> {
    const acf = wp.acf && !Array.isArray(wp.acf) ? wp.acf : {};
    const avatar =
        wp._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "";
    const cover = await resolveMediaUrl(acf.cover, avatar);
    const bio =
        (acf.bio?.trim() || stripHtml(wp.content.rendered) || "").trim();

    const socials: Artist["socials"] = {};
    if (acf.instagram) socials.instagram = acf.instagram;
    if (acf.youtube) socials.youtube = acf.youtube;
    if (acf.spotify) socials.spotify = acf.spotify;
    if (acf.tiktok) socials.tiktok = acf.tiktok;
    if (acf.deezer) socials.deezer = acf.deezer;

    const youtubeSubscribers = Number(acf.youtube_subscribers);
    const insights: Artist["insights"] = {};
    if (Number.isFinite(youtubeSubscribers) && youtubeSubscribers > 0) {
        insights.youtubeSubscribers = youtubeSubscribers;
    }

    return {
        id: wp.id,
        slug: wp.slug,
        name: stripHtml(wp.title.rendered),
        role: acf.role?.trim() || "Artista",
        avatar,
        cover: cover || avatar,
        bio,
        city: acf.city?.trim() || "",
        whatsapp: acf.whatsapp?.trim() || "",
        email: acf.email?.trim() || "",
        socials,
        ...(Object.keys(insights).length > 0 ? { insights } : {}),
    };
}

export async function getArtists(): Promise<Artist[]> {
    const res = await fetch(`${WP}/artista?_embed&per_page=100`);
    if (!res.ok) throw new Error(`WordPress ${res.status}`);
    const data = (await res.json()) as WpArtist[];
    return Promise.all(data.map(mapArtist));
}

export async function getArtistBySlug(
    slug: string,
): Promise<Artist | undefined> {
    const res = await fetch(
        `${WP}/artista?slug=${encodeURIComponent(slug)}&_embed`,
    );
    if (!res.ok) throw new Error(`WordPress ${res.status}`);
    const data = (await res.json()) as WpArtist[];
    const first = data[0];
    return first ? mapArtist(first) : undefined;
}

/** Notícias que marcaram o artista no campo ACF `artistas`. */
export async function getPostsByArtist(slug: string): Promise<Post[]> {
    const [res, idToSlug] = await Promise.all([
        fetch(`${WP}/posts?_embed&per_page=100`),
        getArtistIdToSlug(),
    ]);
    if (!res.ok) throw new Error(`WordPress ${res.status}`);
    const data = (await res.json()) as Parameters<typeof mapPost>[0][];
    return data
        .map((p) => mapPost(p, idToSlug))
        .filter((p) => p.artistSlugs.includes(slug));
}