/** Seções da plataforma. Fonte do menu lateral e do título das páginas. */
export interface Secao {
  slug: string;
  menu: string; // rótulo no menu lateral
  titulo: string; // título da página (<h1> e <title>)
}

export const SECOES: Secao[] = [
  {
    slug: "home",
    menu: "Home",
    titulo: "Bem vindos(as)",
  },
  {
    slug: "dados-noaa",
    menu: "Dados Noaa",
    titulo: "Análise - Base de Dados Noaa",
  },
  {
    slug: "menu-3",
    menu: "Dados Cemaden",
    titulo: "Dados Cemaden",
  },
  {
    slug: "menu-4",
    menu: "Menu-4",
    titulo: "Menu-4",
  },
  {
    slug: "menu-5",
    menu: "Menu-5",
    titulo: "Menu-5",
  },
  {
    slug: "menu-6",
    menu: "Menu-6",
    titulo: "Menu-6",
  },
  {
    slug: "menu-7",
    menu: "Menu-7",
    titulo: "Menu-7",
  },
];
