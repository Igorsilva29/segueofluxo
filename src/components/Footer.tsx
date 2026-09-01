import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Logo } from "./Logo";
import { SITE } from "@/data/mockData";

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-2 gap-10">
        <div>
          <Logo className="text-lg" />
          <p className="text-muted text-sm mt-3 max-w-sm leading-relaxed">{SITE.tagline}</p>
          <div className="flex flex-wrap gap-2 mt-5">
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-full border border-line text-[12px] text-muted hover:text-ink transition-colors"
            >
              {SITE.instagramHandle}
            </a>
            <a
              href={SITE.tiktok}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-full border border-line text-[12px] text-muted hover:text-ink transition-colors"
            >
              TikTok
            </a>
            <a
              href={SITE.youtube}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-full border border-line text-[12px] text-muted hover:text-ink transition-colors"
            >
              YouTube
            </a>
            <a
              href={SITE.spotify}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-full border border-line text-[12px] text-muted hover:text-ink transition-colors"
            >
              Spotify
            </a>
          </div>
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg">Assine a newsletter</h2>
          <p className="text-muted text-sm mt-2">Resumo da semana, sem ruído. Uma vez por semana.</p>
          <form
            className="mt-4 flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              toast.success("Inscrição confirmada! Bem-vindo ao fluxo.");
              setEmail("");
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="min-w-0 flex-1 bg-flow border border-line rounded-full px-5 py-3 text-sm placeholder:text-muted focus:outline-none focus:border-mint"
            />
            <button className="shrink-0 px-6 py-3 rounded-full bg-mint text-flow font-semibold text-sm hover:brightness-95 transition">
              Assinar
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-5 flex flex-col sm:flex-row gap-2 justify-between text-[12px] text-muted">
          <span>© 2026 Segue o Fluxo · Todos os direitos reservados</span>
          <span className="flex gap-3">
            <Link to="/noticias" className="hover:text-ink transition-colors">
              Notícias
            </Link>
            <Link to="/radar" className="hover:text-ink transition-colors">
              Radar
            </Link>
            <Link to="/anuncie" className="hover:text-ink transition-colors">
              Contato
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
