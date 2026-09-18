import { Link } from "@tanstack/react-router";
import { type Post, timeAgo } from "@/data/mockData";

const tagColor: Record<string, string> = {
  Entrevistas: "text-mint",
  Lançamentos: "text-blush",
  Bailes: "text-ink/80",
  Polêmicas: "text-blush",
};

export function NewsCard({ post }: { post: Post }) {
  return (
    <article className="h-full rounded-3xl bg-surface border border-line overflow-hidden">
      <Link
        to="/noticias/$slug"
        params={{ slug: post.slug }}
        className="group flex h-full flex-col"
      >
        <img
          src={post.cover}
          alt={post.title}
          loading="lazy"
          width={1024}
          height={768}
          className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="flex flex-1 flex-col p-5">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${tagColor[post.category] ?? "text-mint"}`}
          >
            {post.category}
          </span>
          <h3 className="font-display text-lg font-semibold leading-tight mt-2 min-h-[5em] text-pretty line-clamp-4">
            {post.title}
          </h3>
          <div className="mt-auto flex items-center gap-2 pt-3 text-[12px] text-muted">
            <span>{timeAgo(post.date)}</span>
            <span className="size-1 rounded-full bg-line" />
            <span>{post.readingTime} min</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function NewsRowCard({ post }: { post: Post }) {
  return (
    <article className="h-full min-h-0 overflow-hidden rounded-2xl bg-surface border border-line p-3">
      <Link to="/noticias/$slug" params={{ slug: post.slug }} className="group flex gap-3 h-full min-h-0">
        <div className="w-24 h-26 shrink-0 overflow-hidden rounded-md self-center">
          <img
            src={post.cover}
            alt={post.title}
            loading="lazy"
            width={512}
            height={512}
            className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${tagColor[post.category] ?? "text-mint"}`}
          >
            {post.category}
          </span>
          <h3 className="font-display font-semibold text-[15px] leading-snug mt-1 text-clamp-3">
            {post.title}
          </h3>
          <p className="text-[12px] text-muted mt-1">{timeAgo(post.date)}</p>
        </div>
      </Link>
    </article>
  );
}
