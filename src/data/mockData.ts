/**
 * Dados simulados (mock) do portal SEGUE O FLUXO.
 *
 * A forma dos objetos abaixo foi pensada para espelhar a REST API do
 * WordPress headless. Para migrar, basta trocar as funções `getPosts`,
 * `getPostBySlug`, `getArtists` e `getArtistBySlug` por chamadas `fetch`:
 *
 *   const res = await fetch(`${WP_URL}/wp-json/wp/v2/posts?_embed`)
 *   const res = await fetch(`${WP_URL}/wp-json/wp/v2/artists?_embed`)
 *
 * Mantenha o mesmo retorno (Post[] / Artist[]) e nenhum componente precisa mudar.
 */

import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";
import news4 from "@/assets/news-4.jpg";
import news5 from "@/assets/news-5.jpg";
import news6 from "@/assets/news-6.jpg";
import artist1 from "@/assets/artist-1.jpg";
import artist2 from "@/assets/artist-2.jpg";
import artist3 from "@/assets/artist-3.jpg";
import artist4 from "@/assets/artist-4.jpg";
import artistCover from "@/assets/artist-cover.jpg";
import playlistCover from "@/assets/playlist.jpg";

export const CATEGORIES = [
  "Todas",
  "Lançamentos",
  "Novidades",
  "Polêmicas",
  "Bailes",
  "Entrevistas",
] as const;

export type Category = Exclude<(typeof CATEGORIES)[number], "Todas">;

export type PostBlock =
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "heading"; text: string }
  | { type: "youtube"; id: string; title: string }
  | { type: "instagram"; url: string; caption: string }
  | { type: "gallery"; urls: string[] };

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  badge?: "POLÊMICA" | "EXCLUSIVO";
  cover: string;
  author: string;
  source?: string;
  date: string; // ISO
  readingTime: number; // minutos
  city?: string;
  artistSlugs: string[];
  content: PostBlock[];
}

export interface Artist {
  id: number;
  slug: string;
  name: string;
  role: string;
  avatar: string;
  cover: string;
  bio: string;
  city: string;
  whatsapp: string;
  email: string;
  socials: { instagram?: string; youtube?: string; spotify?: string; tiktok?: string };
}

export const SITE = {
  name: "SEGUE O FLUXO",
  tagline: "Portal independente de notícias e cultura funk. Feito no bairro, para o bairro.",
  instagram: "https://instagram.com/segueofluxooriginal",
  instagramHandle: "@segueofluxooriginal",
  tiktok: "https://tiktok.com/@segueofluxooriginal",
  youtube: "https://youtube.com/@segueofluxooriginal",
  spotify: "https://open.spotify.com/playlist/37i9dQZF1DX2apWzyECwyZ",
  spotifyEmbed: "https://open.spotify.com/embed/playlist/37i9dQZF1DX2apWzyECwyZ?utm_source=generator&theme=0",
  whatsapp: "https://wa.me/5511999999999",
  email: "contato@segueofluxo.com.br",
  playlistCover,
};

export const artists: Artist[] = [
  {
    id: 1,
    slug: "mc-ryan-sp",
    name: "MC Ryan SP",
    role: "MC / Cantor",
    avatar: artist1,
    cover: artistCover,
    bio: "De Vila Ema para o país inteiro. Ryan virou referência do funk paulista com letras de bairro e melodias que grudam no primeiro refrão.",
    city: "São Paulo, SP",
    whatsapp: "https://wa.me/5511999999991",
    email: "shows@mcryansp.com.br",
    socials: { instagram: "#", youtube: "#", spotify: "#" },
  },
  {
    id: 2,
    slug: "mc-cabelinho",
    name: "MC Cabelinho",
    role: "MC / Vocalista",
    avatar: artist2,
    cover: artistCover,
    bio: "Voz marcante e escrita afiada. Cabelinho transita entre o funk melody, o rap e a cena audiovisual sem perder a origem.",
    city: "Rio de Janeiro, RJ",
    whatsapp: "https://wa.me/5521999999992",
    email: "contato@mccabelinho.com.br",
    socials: { instagram: "#", youtube: "#", spotify: "#" },
  },
  {
    id: 3,
    slug: "dj-gabriel-do-bdt",
    name: "DJ Gabriel do BDT",
    role: "DJ / Produtor",
    avatar: artist3,
    cover: artistCover,
    bio: "Produtor por trás de alguns dos beats mais tocados nos bailes. Assinatura pesada, grave sujo e viradas que param a pista.",
    city: "São Paulo, SP",
    whatsapp: "https://wa.me/5511999999993",
    email: "booking@djgabrieldobdt.com",
    socials: { instagram: "#", youtube: "#", spotify: "#" },
  },
  {
    id: 4,
    slug: "mc-kaya",
    name: "MC Kaya",
    role: "MC / Compositora",
    avatar: artist4,
    cover: artistCover,
    bio: "Nome novo do radar, Kaya mistura funk 150 com influências de R&B e escreve todas as próprias letras.",
    city: "Belo Horizonte, MG",
    whatsapp: "https://wa.me/5531999999994",
    email: "kaya@segueofluxo.com.br",
    socials: { instagram: "#", tiktok: "#", spotify: "#" },
  },
];

const body = (extra: PostBlock[] = []): PostBlock[] => [
  {
    type: "paragraph",
    text: "O que começou como um vídeo de trinta segundos gravado no celular virou o assunto da semana no funk. A repercussão chegou às rádios de bairro, aos perfis de fofoca e, claro, aos comentários de quem estava lá.",
  },
  {
    type: "paragraph",
    text: "A equipe do SEGUE O FLUXO conversou com pessoas presentes no local e com quem acompanha a carreira de perto para entender o que realmente aconteceu — e o que muda daqui pra frente.",
  },
  { type: "heading", text: "O que rolou de verdade" },
  {
    type: "paragraph",
    text: "Segundo três relatos independentes, a confusão começou depois do encerramento do som, quando parte do público insistiu em continuar no local. A produção afirma que seguiu todas as orientações combinadas previamente.",
  },
  {
    type: "quote",
    text: "A gente só quer fazer o baile acontecer em paz. O funk move a cidade, gera trabalho pra muita gente.",
    cite: "Produtor do evento, em áudio enviado ao portal",
  },
  ...extra,
  {
    type: "paragraph",
    text: "A assessoria confirmou que uma nota oficial deve sair nos próximos dias. O portal segue acompanhando e atualiza esta matéria assim que houver novidade.",
  },
];

export const posts: Post[] = [
  {
    id: 101,
    slug: "mc-cabelinho-nova-geracao-funk-paulista",
    title: "MC Cabelinho e a nova geração que está redefinindo o funk paulista",
    excerpt:
      "Um mergulho nas estéticas, nas parcerias e nas raves que estão mudando a cara do gênero na capital.",
    category: "Entrevistas",
    badge: "EXCLUSIVO",
    cover: news1,
    author: "Redação Segue o Fluxo",
    date: "2026-08-30T22:00:00Z",
    readingTime: 4,
    artistSlugs: ["mc-cabelinho", "mc-ryan-sp"],
    content: body([
      { type: "youtube", id: "dQw4w9WgXcQ", title: "Bastidores da entrevista" },
    ]),
  },
  {
    id: 102,
    slug: "dj-gabriel-do-bdt-remix-surpresa",
    title: "DJ Gabriel do BDT solta remix surpresa às 3 da manhã",
    excerpt: "O beat vazou em áudio de grupo antes do lançamento oficial e já domina os stories.",
    category: "Lançamentos",
    cover: news2,
    author: "Duda Reis",
    date: "2026-08-30T19:00:00Z",
    readingTime: 3,
    artistSlugs: ["dj-gabriel-do-bdt"],
    content: body(),
  },
  {
    id: 103,
    slug: "baile-da-vila-recorde-de-publico",
    title: "Baile da Vila bate recorde de público e vira caso de estudo",
    excerpt: "Organização estima o maior público dos últimos cinco anos, com estrutura dobrada.",
    category: "Bailes",
    badge: "POLÊMICA",
    cover: news3,
    author: "Redação Segue o Fluxo",
    date: "2026-08-30T16:00:00Z",
    readingTime: 5,
    artistSlugs: ["mc-ryan-sp"],
    content: body(),
  },
  {
    id: 104,
    slug: "mc-ryan-sp-do-bairro-ao-topo",
    title: "MC Ryan SP fala sobre o caminho do bairro ao topo",
    excerpt: "Entre estúdio, shows e família, o MC conta como organiza a rotina depois do estouro.",
    category: "Entrevistas",
    cover: news4,
    author: "Rafa Lima",
    date: "2026-08-29T14:00:00Z",
    readingTime: 6,
    artistSlugs: ["mc-ryan-sp"],
    content: body([
      {
        type: "instagram",
        url: "https://instagram.com/segueofluxooriginal",
        caption: "Trecho da conversa publicado no nosso Instagram",
      },
    ]),
  },
  {
    id: 105,
    slug: "ep-que-ninguem-esperava",
    title: "O EP que ninguém esperava: sete faixas em uma madrugada",
    excerpt: "Gravado em três dias, o trabalho reúne convidados de quatro estados diferentes.",
    category: "Lançamentos",
    cover: news5,
    author: "Duda Reis",
    date: "2026-08-28T21:30:00Z",
    readingTime: 3,
    artistSlugs: ["dj-gabriel-do-bdt", "mc-kaya"],
    content: body(),
  },
  {
    id: 106,
    slug: "guia-bailes-fim-de-semana",
    title: "Guia: onde ir no fim de semana sem perder a vibe",
    excerpt: "Do centro à zona leste, os bailes e festas com line-up confirmado.",
    category: "Bailes",
    cover: news6,
    author: "Redação Segue o Fluxo",
    date: "2026-08-27T11:00:00Z",
    readingTime: 5,
    artistSlugs: ["mc-kaya"],
    content: body(),
  },
];

/* ---- "API" layer: troque o corpo destas funções por fetch do WordPress ---- */

export function getPosts(category?: string): Post[] {
  if (!category || category === "Todas") return posts;
  return posts.filter((p) => p.category === category);
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRelatedPosts(post: Post, limit = 3): Post[] {
  return posts
    .filter((p) => p.id !== post.id)
    .sort((a, b) => (a.category === post.category ? -1 : 1))
    .slice(0, limit);
}

export function getArtists(): Artist[] {
  return artists;
}

export function getArtistBySlug(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug);
}

export function getPostsByArtist(slug: string): Post[] {
  return posts.filter((p) => p.artistSlugs.includes(slug));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.round(diff / 3_600_000);
  if (h < 1) return "agora há pouco";
  if (h < 24) return `há ${h}h`;
  const d = Math.round(h / 24);
  return d === 1 ? "há 1 dia" : `há ${d} dias`;
}
