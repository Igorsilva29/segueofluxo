import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Play } from "lucide-react";
import {
  CATEGORIES,
  SITE,
  getArtists,
  timeAgo,
} from "@/data/mockData";
import { getPosts, getCategories, getCarouselPosts, getSidebarPosts } from "@/data/wordpress";
import { fetchMostViewedPosts } from "@/data/most-viewed";
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
import recentes from "@/assets/RECENTES.svg";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [posts, wpCategories, featured, secondary, mostViewed] = await Promise.all([
      getPosts(),
      getCategories(),
      getCarouselPosts(),
      getSidebarPosts(),
      fetchMostViewedPosts(),
    ]);
    return { posts, featured, secondary, mostViewed, categories: ["Últimas Notícias", ...wpCategories] };
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

function fillSlots<T extends { id: number }>(
  tagged: T[],
  pool: T[],
  size: number,
  used: Set<number>,
) : T[] {
  const slots = tagged.filter((p) => !used.has(p.id)).slice(0, size);
  for (const p of slots) used.add(p.id);
  for (const p of pool) {
    if (slots.length >= size) break;
    if (used.has(p.id)) continue;
    slots.push(p);
    used.add(p.id);
  }
  return slots;
}

function rotateCategoryToFront(items: string[], selected: string): string[] {
  const index = items.indexOf(selected);
  if (index <= 0) return items;
  return [...items.slice(index), ...items.slice(0, index)];
}

const CATEGORY_FLIP_MS = 680;
const CATEGORY_FLIP_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Quanto cada categoria por baixo fica visível (px). Ajuste aqui o espaçamento. */
const CATEGORY_PEEK_PX = 60;

function Home() {
  const {
    posts,
    categories,
    featured: taggedFeatured,
    secondary: taggedSecondary,
    mostViewed = [],
  } = Route.useLoaderData();
  const [filter, setFilter] = useState<string>("Últimas Notícias");
  const [categoryOrder, setCategoryOrder] = useState<string[]>(categories);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const stackRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef(new Map<string, HTMLElement>());
  const flipFromRef = useRef<Map<string, DOMRect> | null>(null);

  useEffect(() => {
    setCategoryOrder((prev) => {
      const kept = prev.filter((c) => categories.includes(c));
      const added = categories.filter((c) => !kept.includes(c));
      return [...kept, ...added];
    });
  }, [categories]);

  useLayoutEffect(() => {
    let stackEnd = 0;
    let stackHeight = 0;

    categoryOrder.forEach((c, i) => {
      const el = chipRefs.current.get(c);
      if (!el) return;

      el.style.position = "absolute";
      el.style.top = "0px";
      el.style.marginLeft = "0px";

      const width = el.offsetWidth;
      stackHeight = Math.max(stackHeight, el.offsetHeight);

      if (i === 0) {
        el.style.left = "0px";
        stackEnd = width;
      } else {
        // Só CATEGORY_PEEK_PX fica pra fora da chip anterior
        el.style.left = `${stackEnd + CATEGORY_PEEK_PX - width}px`;
        stackEnd += CATEGORY_PEEK_PX;
      }
    });

    if (stackRef.current) {
      stackRef.current.style.width = `${stackEnd}px`;
      stackRef.current.style.height = `${stackHeight}px`;
    }

    const from = flipFromRef.current;
    if (!from) return;
    flipFromRef.current = null;

    const animations: Animation[] = [];
    chipRefs.current.forEach((el, key) => {
      const prev = from.get(key);
      if (!prev) return;
      const next = el.getBoundingClientRect();
      const dx = prev.left - next.left;
      const dy = prev.top - next.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

      const anim = el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: "translate(0px, 0px)" },
        ],
        {
          duration: CATEGORY_FLIP_MS,
          easing: CATEGORY_FLIP_EASE,
          fill: "both",
        },
      );
      animations.push(anim);
    });

    return () => {
      animations.forEach((a) => a.cancel());
    };
  }, [categoryOrder]);

  const selectCategory = (c: string) => {
    setFilter(c);
    const from = new Map<string, DOMRect>();
    chipRefs.current.forEach((el, key) => {
      from.set(key, el.getBoundingClientRect());
    });
    flipFromRef.current = from;
    setCategoryOrder((prev) => rotateCategoryToFront(prev, c));
  };

  const used = new Set<number>();
  const featured = fillSlots(taggedFeatured, posts, 3, used);
  const secondary = fillSlots(taggedSecondary, posts, 3, used);
  const featuredIds = new Set([...featured, ...secondary].map((p) => p.id));
  const feed = posts
    .filter((p) =>
      filter === "Últimas Notícias" ? true : p.category === filter,
    )
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
                  const subtitle = hero.content.find((b) => b.type === "paragraph");
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
                              className="w-full aspect-[16/10] md:aspect-[16/9] object-cover object-[center_30%] transition-transform duration-500 group-hover:scale-[1.03]"
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
                            <Heading className="font-display text-3xl sm:text-4xl md:text-[2.6rem] font-bold leading-[1.05] tracking-tight text-pretty">
                              {hero.title}
                            </Heading>
                            <p className="mt-3 text-muted text-sm leading-relaxed max-w-xl">
                              {subtitle?.type === "paragraph" ? subtitle.text : hero.excerpt}
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

          <div className="relative flex flex-col gap-4 min-w-0">
            <div className="grid grid-rows-3 gap-2 aspect-[4/5] md:aspect-[7.7/9] min-h-0">
              {secondary.map((p) => (
                <NewsRowCard key={p.id} post={p} />
              ))}
            </div>

            {mostViewed.length > 0 && (
              <div className="pt-3 border-t border-line">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blush">
                  Mais vistas
                </span>
                <ul className="mt-2 divide-y divide-line">
                  {mostViewed.map((p) => (
                    <li key={p.id} className="py-2 first:pt-0 last:pb-0">
                      <Link
                        to="/noticias/$slug"
                        params={{ slug: p.slug }}
                        className="font-display text-[13px] font-semibold leading-snug hover:text-mint transition-colors line-clamp-2"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feed */}
      <section className="relative pb-12 pt-10">
        <img
          src={recentes}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 z-0 w-full sm:w-[min(100%,1100px)] -translate-x-1/2 select-none opacity-90"
        />
        <nav
          aria-label="Categorias"
          className="relative z-10 overflow-visible px-1 pt-3 pb-10"
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <div ref={stackRef} className="relative">
            {categoryOrder.map((c, i) => {
              const active = filter === c;
              const hovered = hoveredCategory === c;
              const dimmed = Boolean(hoveredCategory) && !hovered;
              const lifted = hovered || (!hoveredCategory && active);
              const zIndex = hovered
                ? 100
                : active && !hoveredCategory
                  ? 50
                  : categoryOrder.length - i;
              return (
                <span
                  key={c}
                  ref={(el) => {
                    if (el) chipRefs.current.set(c, el);
                    else chipRefs.current.delete(c);
                  }}
                  className="absolute top-0 inline-flex will-change-transform"
                  style={{ zIndex }}
                >
                  <button
                    type="button"
                    onClick={() => selectCategory(c)}
                    onMouseEnter={() => setHoveredCategory(c)}
                    onMouseLeave={() =>
                      setHoveredCategory((h) => (h === c ? null : h))
                    }
                    onFocus={() => setHoveredCategory(c)}
                    onBlur={() =>
                      setHoveredCategory((h) => (h === c ? null : h))
                    }
                    aria-pressed={active}
                    className={`
                      shrink-0 rounded-full border px-5 py-2.5
                      text-[13px] font-display font-semibold tracking-tight whitespace-nowrap
                      transition-[color,background-color,border-color,box-shadow,transform,filter]
                      duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint
                      ${
                        lifted
                          ? "-translate-y-0.5 scale-[1.05] shadow-[0_10px_28px_-12px_rgba(0,0,0,0.35)]"
                          : "scale-100 shadow-none"
                      }
                      ${dimmed ? "brightness-[0.62]" : "brightness-100"}
                      ${
                        active
                          ? "bg-mint text-flow border-mint"
                          : "bg-surface text-muted border-line hover:text-ink hover:border-mint/70"
                      }
                    `}
                  >
                    {c}
                  </button>
                </span>
              );
            })}
          </div>
        </nav>

        {feed.length === 0 ? (
          <p
            key={`empty-${filter}`}
            className="relative z-10 text-sm text-muted animate-in fade-in-0 duration-500"
          >
            Nenhuma notícia nessa categoria ainda.
          </p>
        ) : (
          <div
            key={filter}
            className="relative z-10 grid sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {feed.map((p, i) => (
              <div
                key={p.id}
                className="h-full animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-both duration-500 ease-out"
                style={{
                  animationDelay: `${Math.min(i, 11) * 40}ms`,
                }}
              >
                <NewsCard post={p} />
              </div>
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
