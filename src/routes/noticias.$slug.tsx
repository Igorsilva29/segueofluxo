import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Instagram, Link2, MapPin, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDate, artists } from "@/data/mockData";
import { getPostBySlug, getRelatedPosts } from "@/data/wordpress";
import { NewsCard } from "@/components/NewsCard";

export const Route = createFileRoute("/noticias/$slug")({
  loader: async ({ params }) => {
    const post = await getPostBySlug(params.slug);
    if (!post) throw notFound();
    const related = await getRelatedPosts(post);
    return { post, related };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Notícia não encontrada — SEGUE O FLUXO" }, { name: "robots", content: "noindex" }],
      };
    }
    const { post } = loaderData;
    const title = `${post.title} — SEGUE O FLUXO`;
    return {
      meta: [
        { title },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: PostNotFound,
  component: PostPage,
});

function PostNotFound() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Notícia não encontrada</h1>
      <Link to="/noticias" className="mt-4 inline-block text-mint text-sm">
        Ver todas as notícias
      </Link>
    </main>
  );
}

function PostPage() {
  const { post, related } = Route.useLoaderData();
  const [lightbox, setLightbox] = useState<string | null>(null);

  const mentioned = artists.filter((a) => post.artistSlugs.includes(a.slug));

  const share = (target: "whatsapp" | "x" | "copy") => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (target === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${post.title} ${url}`)}`, "_blank");
    } else if (target === "x") {
      window.open(
        `https://x.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`,
        "_blank",
      );
    } else {
      navigator.clipboard?.writeText(url);
      toast.success("Link copiado!");
    }
  };

  return (
    <main>
      <div className="relative">
        <img
          src={post.cover}
          alt={post.title}
          width={1440}
          height={810}
          className="w-full h-56 sm:h-[420px] object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-flow via-flow/30 to-transparent" />
      </div>

      <article className="mx-auto max-w-2xl px-4 -mt-10 relative pb-16">
        <span className="inline-block px-3 py-1 rounded-full bg-blush text-flow text-[11px] font-bold uppercase tracking-wider">
          {post.badge ?? post.category}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold leading-[1.08] tracking-tight mt-4 text-balance">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted mt-4">
          <span>{formatDate(post.date)}</span>
          <span className="size-1 rounded-full bg-line" />
          <span>Autor: {post.author}</span>
          <span className="size-1 rounded-full bg-line" />
          <span>{post.readingTime} min de leitura</span>
          {post.city && (
            <>
              <span className="size-1 rounded-full bg-line" />
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {post.city}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-5 pb-6 border-b border-line">
          <button
            onClick={() => share("whatsapp")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wa text-flow text-[13px] font-semibold hover:brightness-95 transition"
          >
            <MessageCircle className="size-4" /> WhatsApp
          </button>
          <button
            onClick={() => share("x")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line text-[13px] font-semibold hover:border-mint transition"
          >
            X
          </button>
          <button
            onClick={() => share("copy")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line text-[13px] font-semibold hover:border-mint transition"
          >
            <Link2 className="size-4" /> Copiar link
          </button>
        </div>

        <div className="mt-8 space-y-6">
          {post.content.map((block, i) => {
            if (block.type === "paragraph")
              return (
                <p key={i} className="text-[15px] leading-[1.85] text-ink/90">
                  {block.text}
                </p>
              );
            if (block.type === "heading")
              return (
                <h2 key={i} className="font-display text-2xl font-bold tracking-tight pt-2">
                  {block.text}
                </h2>
              );
            if (block.type === "quote")
              return (
                <blockquote
                  key={i}
                  className="border-l-2 border-mint pl-5 py-1 font-display text-xl leading-snug text-balance"
                >
                  “{block.text}”
                  {block.cite && (
                    <cite className="block mt-2 text-[12px] not-italic text-muted font-body">
                      {block.cite}
                    </cite>
                  )}
                </blockquote>
              );
            if (block.type === "youtube")
              return (
                <div key={i} className="rounded-2xl overflow-hidden border border-line">
                  <iframe
                    title={block.title}
                    src={`https://www.youtube.com/embed/${block.id}`}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="w-full aspect-video border-0"
                  />
                </div>
              );
            if (block.type === "gallery")
              return (
                <div
                  key={i}
                  className={`grid gap-3 ${block.urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
                >
                  {block.urls.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setLightbox(src)}
                      className="block w-full overflow-hidden rounded-2xl"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full object-cover aspect-[4/3] cursor-pointer hover:opacity-90 transition"
                      />
                    </button>
                  ))}
                </div>
              );
            return (
              <a
                key={i}
                href={block.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-5 hover:border-mint transition-colors"
              >
                <Instagram className="size-5 text-blush shrink-0" />
                <span className="text-sm">{block.caption}</span>
              </a>
            );
          })}
        </div>

        {mentioned.length > 0 && (
          <div className="mt-10 pt-6 border-t border-line">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mint">
              Citados nesta matéria
            </span>
            <div className="flex flex-wrap gap-2 mt-3">
              {mentioned.map((a) => (
                <Link
                  key={a.slug}
                  to="/artistas/$slug"
                  params={{ slug: a.slug }}
                  className="inline-flex items-center gap-2 pl-1 pr-4 py-1 rounded-full border border-line hover:border-mint transition-colors"
                >
                  <img src={a.avatar} alt="" className="size-7 rounded-full object-cover" />
                  <span className="text-[13px] font-semibold">{a.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="font-display text-2xl font-bold tracking-tight mb-5">Notícias relacionadas</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {related.map((p) => (
            <NewsCard key={p.id} post={p} />
          ))}
        </div>
      </section>
          {lightbox && (
            <div
              role="dialog"
              aria-modal="true"
              onClick={() => setLightbox(null)}
              className="fixed inset-0 z-50 grid place-items-center bg-flow/90 p-4 cursor-zoom-out"
            >
              <img
                src={lightbox}
                alt=""
                className="max-w-[92vw] max-h-[90vh] rounded-2xl object-contain"
              />
            </div>
          )}
    </main>
  );
}
