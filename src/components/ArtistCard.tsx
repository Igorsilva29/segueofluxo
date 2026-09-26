import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Artist } from "@/data/mockData";

/** size-28 = 7rem = 112px */
const AVATAR_PX = 112;
const AVATAR_TOP_PX = 20;

export function ArtistCard({
  artist,
  className = "shrink-0 w-44 sm:w-56",
}: {
  artist: Artist;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [hoverScale, setHoverScale] = useState(3);
  const [hoverShiftY, setHoverShiftY] = useState(0);

  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width < 1 || height < 1) return;

      const restCy = AVATAR_TOP_PX + AVATAR_PX / 2;
      const cardCy = height / 2;

      // Move o centro do círculo pro meio do card no hover (rosto permanece no meio)
      setHoverShiftY(cardCy - restCy);

      // Diâmetro >= diagonal do card (+ folga) pra a curva do círculo não aparecer nas beiradas
      const scale = (Math.hypot(width, height) / AVATAR_PX) * 1.20;
      setHoverScale(scale);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative snap-start overflow-hidden rounded-3xl border border-line bg-surface text-center ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-3xl">
        <img
          src={artist.avatar}
          alt={artist.name}
          loading="lazy"
          width={640}
          height={640}
          className="
            absolute left-1/2 size-28 rounded-full
            object-cover object-center
            origin-center
            transition-transform duration-800 ease-[cubic-bezier(0.22,1,0.36,1)]
            will-change-transform
          "
          style={{
            top: AVATAR_TOP_PX,
            transform: hovered
              ? `translateX(-50%) translateY(${hoverShiftY}px) scale(${hoverScale})`
              : "translateX(-50%) translateY(0) scale(1)",
          }}
        />
        <div
          className="
            absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent
            opacity-0 transition-opacity duration-800 group-hover:opacity-100
          "
        />
      </div>

      <div className="relative z-10 flex min-h-[280px] flex-col items-center px-5 pb-5 pt-40">
        <h3
          className="
            font-display font-semibold text-ink
            transition-all duration-300 ease-out
            group-hover:translate-y-3 group-hover:opacity-0
          "
        >
          {artist.name}
        </h3>
        <p
          className="
            mt-1 text-[12px] text-muted
            transition-all duration-300 ease-out
            group-hover:translate-y-3 group-hover:opacity-0
          "
        >
          {artist.role}
        </p>
        <Link
          to="/artistas/$slug"
          params={{ slug: artist.slug }}
          className="
            mt-auto block w-full rounded-full border border-line py-2
            text-[13px] font-semibold text-mint
            transition-colors duration-300
            hover:border-mint hover:bg-mint hover:text-flow
            group-hover:border-flow/40 group-hover:bg-flow/95 group-hover:text-ink
          "
        >
          Ver Perfil
        </Link>
      </div>
    </div>
  );
}
