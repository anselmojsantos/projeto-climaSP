/** Seções da plataforma. Fonte única para a sidebar e para a Boas Vindas. */
export interface Secao {
  slug: string;
  titulo: string;
  texto: string;
}

export const SECOES: Secao[] = [
  {
    slug: "boas-vindas",
    titulo: "Boas Vindas",
    texto: "Como usar a plataforma e onde ficam os dados de origem.",
  },
  {
    slug: "visao-geral",
    titulo: "Visão Geral",
    texto: "Indicadores climáticos de São Paulo Capital em leitura direta.",
  },
  {
    slug: "mapa-sp",
    titulo: "Mapa de SP",
    texto: "Distribuição geográfica das estações e das subprefeituras.",
  },
  {
    slug: "series-temporais",
    titulo: "Séries temporais",
    texto: "Evolução das variáveis ao longo do tempo.",
  },
  {
    slug: "correlacoes",
    titulo: "Correlações",
    texto: "Relações entre precipitação, temperatura e índices oceânicos.",
  },
  {
    slug: "predicoes",
    titulo: "Predições",
    texto: "Projeções baseadas nos modelos climáticos disponíveis.",
  },
  {
    slug: "alertas",
    titulo: "Alertas",
    texto: "Avisos quando um indicador sai da faixa esperada.",
  },
];