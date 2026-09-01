import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { SITE } from "@/data/mockData";

export const Route = createFileRoute("/anuncie")({
  head: () => ({
    meta: [
      { title: "Anuncie / Mídia Kit — SEGUE O FLUXO" },
      {
        name: "description",
        content:
          "Divulgue música, clipe ou marca no maior portal independente de funk. Mídia kit, formatos e contato direto no WhatsApp.",
      },
      { property: "og:title", content: "Anuncie no SEGUE O FLUXO" },
      {
        property: "og:description",
        content: "Mídia kit para artistas, produtoras e marcas. Portal + Instagram.",
      },
    ],
  }),
  component: AnunciePage,
});

const FORMATOS = [
  { title: "Matéria patrocinada", desc: "Texto completo no portal com foto, embeds e link direto." },
  { title: "Post no Instagram", desc: `Feed e stories no ${SITE.instagramHandle}, com card exclusivo.` },
  { title: "Combo lançamento", desc: "Matéria + post + inclusão na playlist oficial do mês." },
];

function AnunciePage() {
  const [form, setForm] = useState({ nome: "", contato: "", mensagem: "" });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mint">
        Anuncie com a gente
      </span>
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-1 text-balance">
        Feche seu lugar na vitrine do funk
      </h1>
      <p className="text-muted text-sm mt-3 max-w-lg">
        Artistas, produtoras e marcas: divulgue músicas, clipes e campanhas no portal e nas redes.
        Mídia kit completo sob demanda.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        {FORMATOS.map((f) => (
          <div key={f.title} className="rounded-3xl bg-surface border border-line p-5">
            <h2 className="font-display font-semibold text-lg">{f.title}</h2>
            <p className="text-muted text-sm mt-2 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Recebemos seu contato! Respondemos em até 24h.");
            setForm({ nome: "", contato: "", mensagem: "" });
          }}
          className="rounded-[2rem] bg-surface border border-line p-6 sm:p-8 space-y-4"
        >
          <h2 className="font-display text-2xl font-bold tracking-tight">Fale com a redação</h2>
          <input
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Seu nome ou nome artístico"
            className="w-full bg-flow border border-line rounded-full px-5 py-3 text-sm placeholder:text-muted focus:outline-none focus:border-mint"
          />
          <input
            required
            value={form.contato}
            onChange={(e) => setForm({ ...form, contato: e.target.value })}
            placeholder="E-mail ou WhatsApp"
            className="w-full bg-flow border border-line rounded-full px-5 py-3 text-sm placeholder:text-muted focus:outline-none focus:border-mint"
          />
          <textarea
            required
            rows={4}
            value={form.mensagem}
            onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
            placeholder="Conta o que você quer divulgar"
            className="w-full bg-flow border border-line rounded-3xl px-5 py-3 text-sm placeholder:text-muted focus:outline-none focus:border-mint resize-none"
          />
          <button className="w-full px-6 py-3.5 rounded-full bg-mint text-flow font-bold text-sm hover:brightness-95 transition">
            Enviar mensagem
          </button>
        </form>

        <div className="rounded-[2rem] bg-gradient-to-br from-surface2 to-surface border border-line p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight">Prefere no direto?</h2>
          <p className="text-muted text-sm mt-3">
            Chama no WhatsApp e a gente te manda o mídia kit em PDF na hora.
          </p>
          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-wa text-flow font-bold text-sm hover:brightness-95 transition"
          >
            <MessageCircle className="size-4" /> Falar no WhatsApp
          </a>
          <div className="mt-6 space-y-3 text-sm">
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-3 text-muted hover:text-ink transition-colors"
            >
              <Mail className="size-4" /> {SITE.email}
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-muted hover:text-ink transition-colors"
            >
              <Instagram className="size-4" /> {SITE.instagramHandle}
            </a>
          </div>
        </div>
      </div>

      <a
        href={SITE.whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-30 grid place-items-center size-14 rounded-full bg-wa text-flow shadow-lg hover:brightness-95 transition"
      >
        <MessageCircle className="size-6" />
      </a>
    </main>
  );
}
