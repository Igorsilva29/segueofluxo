import { useState } from "react";
import { Play, Youtube } from "lucide-react";
import type { YoutubeTopVideo } from "@/data/youtube-insights";

function formatViews(n: number): string {
  if (n <= 0) return "";
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function VideoPlayer({ video }: { video: YoutubeTopVideo }) {
  const [playing, setPlaying] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="relative aspect-video overflow-hidden bg-flow">
        {playing ? (
          <iframe
            title={video.title}
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 w-full cursor-pointer"
            aria-label={`Reproduzir ${video.title}`}
          >
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt=""
                loading="lazy"
                width={480}
                height={270}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="h-full w-full bg-surface2" />
            )}
            <span className="absolute inset-0 grid place-items-center bg-flow/20 transition group-hover:bg-flow/35">
              <span className="grid size-12 place-items-center rounded-full bg-[#FF0000] text-white shadow-lg transition group-hover:scale-105">
                <Play className="size-5 fill-current translate-x-0.5" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
          {video.title}
        </h3>
        {video.viewCount > 0 ? (
          <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            {formatViews(video.viewCount)} views
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function ArtistYoutubeVideos({
  videos,
  artistName,
}: {
  videos: YoutubeTopVideo[];
  artistName: string;
}) {
  if (videos.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center gap-2">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Últimos videos no canal
        </h2>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0">
        {videos.map((video) => (
          <div
            key={video.id}
            className="w-[min(72vw,280px)] shrink-0 lg:w-auto lg:min-w-0"
          >
            <VideoPlayer video={video} />
          </div>
        ))}
      </div>
    </section>
  );
}
