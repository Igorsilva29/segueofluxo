import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle, Music2, Youtube } from "lucide-react";
import { getArtistBySlug, getPostsByArtist } from "@/data/mockData";
import { NewsCard } from "@/components/NewsCard";

export const Route = createFileRoute("/artistas/$slug")({
  loader: ({ params }) => {
    const artist = getArtistBySlug(params.slug);
    if (!artist) throw notFound();
    return { artist, posts: getPostsByArtist(params.slug) };
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
  const { artist, posts } = Route.useLoaderData();

  return (
    <main>
      <div className="relative">
        <img
          src={artist.cover}
          alt=""
          width={1600}
          height={600}
          className="w-full h-44 sm:h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-flow via-flow/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4 -mt-12 relative">
        <img
          src={artist.avatar}
          alt={artist.name}
          width={640}
          height={640}
          className="size-24 rounded-full object-cover border-4 border-flow"
        />
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-4">
          {artist.name}
        </h1>
        <p className="text-[12px] uppercase tracking-[0.2em] text-mint mt-1">
          {artist.role} · {artist.city}
        </p>
        <p className="text-muted text-sm mt-4 max-w-2xl leading-relaxed">{artist.bio}</p>

        <div className="flex flex-wrap gap-3 mt-6">
          <a
            href={artist.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-wa text-flow font-bold text-sm hover:brightness-95 transition"
          >
            <MessageCircle className="size-4" /> Contato para shows
          </a>
          <a
            href={`mailto:${artist.email}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-line text-sm font-semibold text-ink hover:border-mint transition"
          >
            <Mail className="size-4" /> {artist.email}
          </a>
        </div>

        <div className="flex gap-2 mt-4">
          {artist.socials.instagram && (
            <a
              href={artist.socials.instagram}
              aria-label="Instagram"
              className="grid place-items-center size-11 rounded-full border border-line text-muted hover:text-mint hover:border-mint transition-colors"
            >
              <Instagram className="size-[18px]" />
            </a>
          )}
          {artist.socials.youtube && (
            <a
              href={artist.socials.youtube}
              aria-label="YouTube"
              className="grid place-items-center size-11 rounded-full border border-line text-muted hover:text-mint hover:border-mint transition-colors"
            >
              <Youtube className="size-[18px]" />
            </a>
          )}
          {(artist.socials.spotify || artist.socials.tiktok) && (
            <a
              href={artist.socials.spotify ?? artist.socials.tiktok}
              aria-label="Música"
              className="grid place-items-center size-11 rounded-full border border-line text-muted hover:text-mint hover:border-mint transition-colors"
            >
              <Music2 className="size-[18px]" />
            </a>
          )}
        </div>

        <section className="py-12">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-5">
            Notícias e lançamentos citando {artist.name}
          </h2>
          {posts.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma matéria por enquanto. Volta depois.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
