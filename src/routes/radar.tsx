import { createFileRoute } from "@tanstack/react-router";
import { getArtists } from "@/data/mockData";
import { ArtistCard } from "@/components/ArtistCard";

export const Route = createFileRoute("/radar")({
  head: () => ({
    meta: [
      { title: "Radar de Artistas — SEGUE O FLUXO" },
      {
        name: "description",
        content: "MCs, DJs e produtores em movimento no funk brasileiro. Perfis, contatos e notícias.",
      },
      { property: "og:title", content: "Radar de Artistas — SEGUE O FLUXO" },
      {
        property: "og:description",
        content: "MCs, DJs e produtores em movimento no funk brasileiro.",
      },
    ],
  }),
  component: RadarPage,
});

function RadarPage() {
  const artists = getArtists();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mint">
        Radar do Funk
      </span>
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-1">
        Artistas em movimento
      </h1>
      <p className="text-muted text-sm mt-3 max-w-lg">
        Quem está soltando som, lotando baile e movimentando a cena agora.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {artists.map((a) => (
          <ArtistCard key={a.id} artist={a} className="w-full" />
        ))}
      </div>

    </main>
  );
}
