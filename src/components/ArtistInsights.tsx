import type { Artist } from "@/data/mockData";

function formatCompact(n: number): string {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    compactDisplay: "short",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(n)
    .replace(/\s?mi\.?/i, "M")
    .replace(/\s?mil\.?/i, "K");
}

export function ArtistInsights({
  insights,
  className = "",
}: {
  insights?: Artist["insights"];
  className?: string;
}) {
  const youtube = insights?.youtubeSubscribers;
  const deezer = insights?.deezerFans;

  if (!youtube && !deezer) return null;

  return (
    <div className={`flex flex-col items-center gap-4 text-center ${className}`}>
      {youtube ? (
      <div className="leading-none">
        <p
          className="
            font-display text-4xl font-bold tracking-tight text-ink
            sm:text-5xl
            animate-pulse [animation-duration:3.5s] ease-in-out
            motion-reduce:animate-none
          "
        >
          {formatCompact(youtube)}
        </p>
        <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
          Youtube
        </p>
      </div>
      ) : null}

      {deezer ? (
        <div className="leading-none">
          <p
            className="
              font-display text-4xl font-bold tracking-tight text-ink
              sm:text-5xl
              animate-pulse [animation-duration:3.5s] ease-in-out
              motion-reduce:animate-none
            "
          >
            {formatCompact(deezer)}
          </p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.22rem] text-muted">
            Deezer
          </p>
        </div>
      ) : null}
    </div>
  );
}