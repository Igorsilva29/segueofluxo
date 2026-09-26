import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle, Music2, Youtube } from "lucide-react";
import {
  getArtistBySlug,
  getPostsByArtist,
} from "@/data/wordpress";
import { NewsCard } from "@/components/NewsCard";
import { ArtistInsights } from "@/components/ArtistInsights";
import { ArtistYoutubeVideos } from "@/components/ArtistYoutubeVideos";
import {
  fetchTopYoutubeVideos,
  fetchYoutubeSubscribers,
  type YoutubeTopVideo,
} from "@/data/youtube-insights";
import { fetchDeezerFans } from "@/data/deezer-insights";

function spotifyArtistEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(?:embed\/)?artist\/([a-zA-Z0-9]+)/i,
  );
  return match?.[1]
    ? `https://open.spotify.com/embed/artist/${match[1]}?utm_source=generator`
    : null;
}

export const Route = createFileRoute("/artistas/$slug")({
  loader: async ({ params }) => {
    const artist = await getArtistBySlug(params.slug);
    if (!artist) throw notFound();
    const posts = await getPostsByArtist(params.slug);

    let insights = artist.insights ?? {};
    let topVideos: YoutubeTopVideo[] = [];

    if (artist.socials.youtube) {
      const youtubeUrl = artist.socials.youtube;
      const [fromApi, videos] = await Promise.all([
        fetchYoutubeSubscribers({ data: { youtubeUrl } }),
        fetchTopYoutubeVideos({ data: { youtubeUrl, limit: 5 } }),
      ]);
      if (fromApi != null) {
        insights = { ...insights, youtubeSubscribers: fromApi };
      }
      topVideos = videos;
    }
    if (artist.socials.deezer) {
      const fans = await fetchDeezerFans({
        data: { deezerUrl: artist.socials.deezer },
      });
      if (fans != null) {
        insights = { ...insights, deezerFans: fans };
      }
    }
    return { artist: { ...artist, insights }, posts, topVideos };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Artista não encontrado — SEGUE O FLUXO" }, { name: "robots", content: "noindex" }],
      };
    }
    const { artist } = loaderData;
    const title = `${artist.name} — ${artist.role} | SEGUE O FLUXO`;
    return {
      meta: [
        { title },
        { name: "description", content: artist.bio },
        { property: "og:title", content: title },
        { property: "og:description", content: artist.bio },
      ],
    };
  },
  notFoundComponent: ArtistNotFound,
  component: ArtistPage,
});

function ArtistNotFound() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Artista não encontrado</h1>
      <Link to="/radar" className="mt-4 inline-block text-mint text-sm">
        Voltar para o radar
      </Link>
    </main>
  );
}

function ArtistPage() {
  const { artist, posts, topVideos } = Route.useLoaderData();
  const spotifyEmbed = spotifyArtistEmbedUrl(artist.socials.spotify);

  return (
    <main>
      <div className="relative">
        <img
          src={artist.cover}
          alt=""
          width={1600}
          height={600}
          className="absolute inset-0 h-full w-full object-cover object-[center_25%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-flow via-flow/55 to-flow/15" />

        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-52 sm:pb-12 sm:pt-64">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-[3.25rem]">
            {artist.name}
          </h1>
          <p className="mt-2 text-[12px] uppercase tracking-[0.2em] text-mint sm:mt-3">
            {[artist.role, artist.city].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {artist.socials.instagram && (
                <a
                  href={artist.socials.instagram}
                  arial-label="Instagram"
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-11 place-items-center rounded-full border border-line/80 bg-flow/80 text-muted backgrop-blur-sm transition-colors hover:border-mint hover:text-mint"
                >
                  <Instagram className="size-[18px]" />
                </a>
              )}
              {artist.socials.youtube && (
                <a
                  href={artist.socials.youtube}
                  aria-label="Youtube"
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-11 place-items-center rounded-full border boder-line/80 bg-flow/80 text-muted backgrop-blur-sm transition-colors hover:border-mint hover:text-mint"
                >
                  <Youtube className="size-[18px]" />
                </a>
              )}
              {artist.socials.spotify && (
                <a
                  href={artist.socials.spotify}
                  aria-label="Spotify"
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-11 place-items-center rounded-full border boder-line/80 bg-flow/80 text-muted backgrop-blur-sm transition-colors hover:border-mint hover:text-mint"
                >
                  <Music2 className="size-[18px]" />
                </a>
              )}
            </div>

            <ArtistInsights insights={artist.insights} />
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pt-6">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">{artist.bio}</p>

        <ArtistYoutubeVideos videos={topVideos} artistName={artist.name} />

        {spotifyEmbed && (
          <section className="mt-10">
            <div className="mb-5 flex items-center gap-2">
              <Music2 className="size-5 text-mint" />
              <h2 className="font-display text-2xl font-bold tracking-tight">
                Ouça na Plataforma de Streaming
              </h2>
            </div>
            <div className="max-w-xl overflow-hidden rounded-2xl border border-line">
              <iframe
                title={`Spotify — ${artist.name}`}
                src={spotifyEmbed}
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                className="w-full border-0"
                style={{ height: 452 }}
              ></iframe>
            </div>
          </section>
        )}

        <section className="py-12">
          <h2 className="mb-5 font-display text-2xl font-bold tracking-tight">
            Notícias que citam {artist.name}
          </h2>
          {posts.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma matéria por enquanto. Volta depois.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <NewsCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
