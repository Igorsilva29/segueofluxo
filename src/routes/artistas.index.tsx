import { createFileRoute, Link } from "@tanstack/react-router";
import { getArtists } from "@/data/mockData";

export const Route = createFileRoute("/artistas/")({
  head: () => ({
    meta: [
      { title: "Artistas do funk — SEGUE O FLUXO" },
      {
        name: "description",
        content: "Perfis de MCs, DJs e produtores com bio, contatos para shows e notícias citadas.",
      },
      { property: "og:title", content: "Artistas do funk — SEGUE O FLUXO" },
      {
        property: "og:description",
        content: "Perfis de MCs, DJs e produtores do funk brasileiro.",
      },
    ],
  }),
  component: ArtistasPage,
});

function ArtistasPage() {
  const artists = getArtists();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Artistas</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {artists.map((a) => (
          <Link
            key={a.id}
            to="/artistas/$slug"
            params={{ slug: a.slug }}
            className="flex items-center gap-4 rounded-3xl bg-surface border border-line p-4 hover:border-mint transition-colors"
          >
            <img
              src={a.avatar}
              alt={a.name}
              loading="lazy"
              width={640}
              height={640}
              className="size-16 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <h2 className="font-display font-semibold truncate">{a.name}</h2>
              <p className="text-[12px] text-muted">{a.role}</p>
              <p className="text-[12px] text-muted">{a.city}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
