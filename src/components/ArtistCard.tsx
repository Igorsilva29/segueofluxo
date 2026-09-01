import { Link } from "@tanstack/react-router";
import type { Artist } from "@/data/mockData";

export function ArtistCard({
  artist,
  className = "shrink-0 w-44 sm:w-56",
}: {
  artist: Artist;
  className?: string;
}) {
  return (
    <div
      className={`snap-start rounded-3xl bg-surface border border-line p-5 text-center ${className}`}
    >

      <img
        src={artist.avatar}
        alt={artist.name}
        loading="lazy"
        width={640}
        height={640}
        className="size-24 mx-auto rounded-full object-cover"
      />
      <h3 className="font-display font-semibold mt-4">{artist.name}</h3>
      <p className="text-[12px] text-muted">{artist.role}</p>
      <Link
        to="/artistas/$slug"
        params={{ slug: artist.slug }}
        className="mt-4 block w-full py-2 rounded-full border border-line text-[13px] font-semibold text-mint hover:bg-mint hover:text-flow transition-colors"
      >
        Ver Perfil
      </Link>
    </div>
  );
}
