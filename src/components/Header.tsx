import { useEffect, useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, X, Instagram, Youtube, Music2, Send } from "lucide-react";
import { Logo } from "./Logo";
import { SITE, artists, posts } from "@/data/mockData";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/noticias", label: "Notícias" },
  { to: "/lancamentos", label: "Lançamentos" },
  { to: "/radar", label: "Radar de Artistas" },
  { to: "/anuncie", label: "Anuncie / Contato" },
] as const;

export function Header() {
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setDrawer(false);
    setSearch(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer, search]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { posts: [], artists: [] };
    return {
      posts: posts.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 5),
      artists: artists.filter((a) => a.name.toLowerCase().includes(q)).slice(0, 4),
    };
  }, [query]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-flow/90 backdrop-blur-md border-b border-line">
        <div className="mx-auto max-w-6xl px-4 h-16 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center">
          <button
            onClick={() => setDrawer(true)}
            aria-label="Abrir menu"
            className="p-2 -ml-2 rounded-xl text-muted hover:text-ink transition-colors"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex justify-center min-w-0">
            <Logo />
          </div>
          <div className="relative flex items-center justify-end">
            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                search ? "w-44 sm:w-56 opacity-100 mr-1" : "w-0 opacity-0"
              }`}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full h-9 rounded-full bg-surface border border-line px-3 text-sm placeholder:text-muted focus:outline-none"
              />
            </div>
            <button
              onClick={() => setSearch((open) => !open)}
              aria-label={search ? "Fechar busca" : "Buscar"}
              className="p-2 -mr-2 rounded-xl text-muted hover:text-ink transition-colors"
            >
              {search ? <X className="size-5" /> : <Search className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer */}
      <div
        className={`fixed inset-0 z-50 ${drawer ? "" : "pointer-events-none"}`}
        aria-hidden={!drawer}
      >
        <div
          onClick={() => setDrawer(false)}
          className={`absolute inset-0 bg-flow/80 backdrop-blur-sm transition-opacity duration-300 ${drawer ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[86%] max-w-sm bg-surface border-r border-line flex flex-col transition-transform duration-300 ease-out ${drawer ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-line">
            <Logo className="text-base" />
            <button
              onClick={() => setDrawer(false)}
              aria-label="Fechar menu"
              className="p-2 -mr-2 text-muted hover:text-ink transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: item.to === "/" }}
                    activeProps={{ className: "text-mint" }}
                    inactiveProps={{ className: "text-ink" }}
                    className="block font-display text-2xl font-bold tracking-tight py-2.5 hover:text-mint transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blush">
                Siga o fluxo
              </span>
              <div className="flex gap-2 mt-3">
                {[
                  { href: SITE.instagram, Icon: Instagram, label: "Instagram" },
                  { href: SITE.tiktok, Icon: Music2, label: "TikTok" },
                  { href: SITE.youtube, Icon: Youtube, label: "YouTube" },
                  { href: SITE.spotify, Icon: Send, label: "Spotify" },
                ].map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid place-items-center size-11 rounded-full border border-line text-muted hover:text-mint hover:border-mint transition-colors"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                ))}
              </div>
              <p className="text-[12px] text-muted mt-3">{SITE.instagramHandle}</p>
            </div>
          </nav>

          <div className="p-5 border-t border-line">
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="block text-center px-5 py-3.5 rounded-full bg-mint text-flow font-bold text-sm hover:brightness-95 transition"
            >
              Enviar Notícia / Sugestão
            </a>
          </div>
        </aside>
      </div>

    </>
  );
}
