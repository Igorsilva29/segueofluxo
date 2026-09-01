import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES, getPosts } from "@/data/mockData";
import { NewsCard } from "@/components/NewsCard";

export const Route = createFileRoute("/noticias/")({
  head: () => ({
    meta: [
      { title: "Notícias do funk — SEGUE O FLUXO" },
      {
        name: "description",
        content:
          "Todas as notícias do funk: polêmicas, bailes, entrevistas e lançamentos atualizados todo dia.",
      },
      { property: "og:title", content: "Notícias do funk — SEGUE O FLUXO" },
      {
        property: "og:description",
        content: "Polêmicas, bailes, entrevistas e lançamentos do funk brasileiro.",
      },
    ],
  }),
  component: NoticiasPage,
});

function NoticiasPage() {
  const [filter, setFilter] = useState<string>("Todas");
  const list = getPosts(filter);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blush">
        Feed principal
      </span>
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-1">
        Últimas notícias
      </h1>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`shrink-0 px-4 py-2 rounded-full text-[13px] transition-colors ${
              filter === c
                ? "bg-mint text-flow font-semibold"
                : "bg-surface border border-line font-medium text-muted hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((p) => (
          <NewsCard key={p.id} post={p} />
        ))}
      </div>
    </main>
  );
}
