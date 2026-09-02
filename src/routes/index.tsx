import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Play } from "lucide-react";
import {
  CATEGORIES,
  SITE,
  getArtists,
  timeAgo,
} from "@/data/mockData";
import { getPosts, getCategories } from "@/data/wordpress";
import { NewsCard, NewsRowCard } from "@/components/NewsCard";
import { ArtistCard } from "@/components/ArtistCard";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [posts, wpCategories] = await Promise.all([getPosts(), getCategories()]);
    return { posts, categories: ["Todas", ...wpCategories] };
  },
  head: () => ({
    meta: [
      { title: "SEGUE O FLUXO — Notícias, lançamentos e bailes do funk" },
      {
        name: "description",
        content:
          "Últimas notícias do funk, lançamentos do mês, radar de MCs e DJs e a agenda dos bailes. Direto da pista.",
      },
      { property: "og:title", content: "SEGUE O FLUXO — Notícias e cultura funk" },
      {
        property: "og:description",
        content: "Notícias, lançamentos, bailes e entrevistas do funk brasileiro.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { posts, categories } = Route.useLoaderData();
  const [filter, setFilter] = useState<string>("Todas");
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const featured = posts.slice(0, 3);
  const secondary = posts.slice(3, 6);
  const featuredIds = new Set(featured.map((p) => p.id));
  const feed = posts
    .filter((p) => (filter === "Todas" ? true : p.category === filter))
    .filter((p) => !featuredIds.has(p.id));
  const artists = getArtists();

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <main className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="pt-8 pb-10">
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blush">
            Radar do dia
          </span>
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] uppercase tracking-[0.15em] text-muted">São Paulo</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 min-w-0">
            <Carousel 
              opts={{ loop: true, align: "start" }} 
              plugins={[
                Autoplay({
                  delay: 4500,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
              setApi={setApi}
              className="w-full"
            >
              <CarouselContent className="-ml-0">
                {featured.map((hero, index) => {
                  const Heading = index === 0 ? "h1" : "h2";
                  return (
                    <CarouselItem key={hero.id} className="pl-0">
                      <article className="group">
                        <Link to="/noticias/$slug" params={{ slug: hero.slug }}>
                          <div className="relative rounded-3xl overflow-hidden">
                            <img
                              src={hero.cover}
                              alt={hero.title}
                              width={1440}
                              height={810}
                              className="w-full aspect-[16/10] md:aspect-[16/9] object-cover object-[center_30%]"
                            />
                            {hero.badge && (
                              <div className="absolute top-4 left-4 flex gap-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                    hero.badge === "POLÊMICA"
                                      ? "bg-blush text-flow"
                                      : "bg-flow/70 text-mint backdrop-blur-sm"
                                  }`}
                                >
                                  {hero.badge === "POLÊMICA" ? "Polêmica" : "Exclusivo"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="pt-5">
                            <div className="flex items-center gap-3 text-[12px] text-muted mb-3">
                              <span className="text-mint font-semibold">{hero.category}</span>
                              <span className="size-1 rounded-full bg-line" />
                              <span>{timeAgo(hero.date)}</span>
                              <span className="size-1 rounded-full bg-line" />
                              <span>{hero.readingTime} min de leitura</span>
                            </div>
                            <Heading className="font-display text-3xl sm:text-4xl md:text-[2.6rem] font-bold leading-[1.05] tracking-tight text-balance">
                              {hero.title}
                            </Heading>
                            <p className="mt-3 text-muted text-sm leading-relaxed max-w-xl">
                              {hero.excerpt}
                            </p>
                          </div>
                        </Link>
                      </article>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            <div className="absolute inset-x-0 top-0 aspect-[12/10] md:aspect-[12/9] pointer-events-none">
              <CarouselPrevious className="pointer-events-auto left-3 top-2/3 -translate-y-1/2 border-line bg-flow/80 text-ink" />
              <CarouselNext className="pointer-events-auto right-3 top-2/3 -translate-y-1/2 border-line bg-flow/80 text-ink" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-38 flex gap-2 pointer-events-auto">
                {featured.map((post, index) => (
                  <button
                    key={post.id}
                    type="button"
                    aria-label={`Ir para notícia ${index + 1}`}
                    aria-current={current === index}
                    onClick={() => api?.scrollTo(index)}
                    className={`h-2 rounded-full transition-all
                      ${current === index ? "w-6 bg-mint" : "w-2 bg-ink/50 hover:bg-ink"
                    }`}
                  />
                ))}
              </div>
            </div>
            </Carousel>
          </div>

          <div className="grid gap-4 content-start">
            {secondary.map((p) => (
              <NewsRowCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Feed */}
      <section className="pb-12">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-5">
          {categories.map((c) => (
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

        {feed.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma notícia nessa categoria ainda.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {feed.map((p) => (
              <NewsCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>

      {/* Radar do Funk */}
      <section className="pb-12">
        <div className="flex items-end justify-between mb-5 gap-4">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mint">
              Radar do Funk
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              Artistas em movimento
            </h2>
          </div>
          <Link to="/radar" className="shrink-0 text-[12px] text-muted hover:text-ink transition-colors">
            Ver todos
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 snap-x">
          {artists.map((a) => (
            <ArtistCard key={a.id} artist={a} />
          ))}
        </div>
      </section>

      {/* Spotify */}
      <section className="pb-12">
        <div className="rounded-[2rem] bg-gradient-to-br from-surface2 to-surface border border-line p-6 sm:p-8 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blush">
              Lançamentos do mês
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-2 leading-tight text-balance">
              A playlist oficial do portal, atualizada toda semana
            </h2>
            <p className="text-muted text-sm mt-3 max-w-md">
              O melhor que chegou no funk agora, curado pela nossa equipe. Toque, salve e
              compartilhe com a galera.
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
      </section>

      {/* Mídia kit */}
      <section className="pb-16">
        <div className="rounded-[2rem] bg-surface border border-line p-6 sm:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mint">
              Anuncie com a gente
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-2 text-balance">
              Feche seu lugar na vitrine do funk
            </h2>
            <p className="text-muted text-sm mt-3 max-w-lg">
              Artistas, produtoras e marcas: divulgue músicas, clipes e campanhas no portal e no
              Instagram {SITE.instagramHandle}. Mídia kit completo sob demanda.
            </p>
          </div>
          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-wa text-flow font-bold text-sm hover:brightness-95 transition md:self-center"
          >
            <MessageCircle className="size-4" /> Falar no WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
