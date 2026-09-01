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
    <article className="rounded-3xl bg-surface border border-line overflow-hidden">
      <Link to="/noticias/$slug" params={{ slug: post.slug }} className="block group">
        <img
          src={post.cover}
          alt={post.title}
          loading="lazy"
          width={1024}
          height={768}
          className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="p-5">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${tagColor[post.category] ?? "text-mint"}`}
          >
            {post.category}
          </span>
          <h3 className="font-display text-lg font-semibold leading-tight mt-2 text-balance">
            {post.title}
          </h3>
          <div className="flex items-center gap-2 text-[12px] text-muted mt-3">
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
    <article className="rounded-2xl bg-surface border border-line p-4">
      <Link to="/noticias/$slug" params={{ slug: post.slug }} className="flex gap-4">
        <img
          src={post.cover}
          alt={post.title}
          loading="lazy"
          width={512}
          height={512}
          className="w-20 self-stretch shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${tagColor[post.category] ?? "text-mint"}`}
          >
            {post.category}
          </span>
          <h3 className="font-display font-semibold text-[15px] leading-snug mt-1 text-balance">
            {post.title}
          </h3>
          <p className="text-[12px] text-muted mt-1">{timeAgo(post.date)}</p>
        </div>
      </Link>
    </article>
  );
}
