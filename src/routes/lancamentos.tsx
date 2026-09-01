import { createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { SITE, getPosts } from "@/data/mockData";
import { NewsCard } from "@/components/NewsCard";

export const Route = createFileRoute("/lancamentos")({
  head: () => ({
    meta: [
      { title: "Lançamentos do mês — SEGUE O FLUXO" },
      {
        name: "description",
        content:
          "Os sons novos que estão dominando os bailes, mais a playlist oficial do Segue o Fluxo no Spotify.",
      },
      { property: "og:title", content: "Lançamentos do mês — SEGUE O FLUXO" },
      {
        property: "og:description",
        content: "Sons novos do funk e a playlist oficial do portal no Spotify.",
      },
    ],
  }),
  component: LancamentosPage,
});

function LancamentosPage() {
  const list = getPosts("Lançamentos");

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blush">
        Toca aí
      </span>
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-1">
        Lançamentos do mês
      </h1>

      <div className="mt-8 rounded-[2rem] bg-gradient-to-br from-surface2 to-surface border border-line p-6 sm:p-8 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight leading-tight text-balance">
            Playlist oficial Segue o Fluxo
          </h2>
          <p className="text-muted text-sm mt-3 max-w-md">
            Atualizada toda semana com o que chegou de mais quente no funk.
          </p>
          <a
            href={SITE.spotify}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-mint text-flow font-semibold text-sm hover:brightness-95 transition"
          >
            <Play className="size-4 fill-flow" /> Siga nossa playlist no Spotify
          </a>
        </div>
        <div className="rounded-2xl bg-flow/60 border border-line p-4">
          <iframe
            title="Playlist oficial Segue o Fluxo no Spotify"
            src={SITE.spotifyEmbed}
            width="100%"
            height="352"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="rounded-xl border-0 w-full"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
        {list.map((p) => (
          <NewsCard key={p.id} post={p} />
        ))}
      </div>
    </main>
  );
}
