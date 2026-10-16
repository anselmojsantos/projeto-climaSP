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
    titulo: "Bem vindos(ass)",
  },
  {
    slug: "dados-noaa",
    menu: "Dados Noaa",
    titulo: "Análise - Base de Dados Noaa",
  },
  {
    slug: "mapa-sp",
    menu: "Mapa de SP",
    titulo: "Mapa de SP",
  },
  {
    slug: "series-temporais",
    menu: "Séries temporais",
    titulo: "Séries temporais",
  },
  {
    slug: "correlacoes",
    menu: "Correlações",
    titulo: "Correlações",
  },
  {
    slug: "predicoes",
    menu: "Predições",
    titulo: "Predições",
  },
  {
    slug: "alertas",
    menu: "Alertas",
    titulo: "Alertas",
  },
];
