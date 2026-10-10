/** Fontes públicas que alimentam o estudo, com a cadência de cada uma. */
export interface Fonte {
  nome: string;
  descricao: string;
  cadencia: string;
}

export const FONTES: Fonte[] = [
  {
    nome: "NOAA / CPC — Oceano Pacífico",
    descricao:
      "SST e índices das regiões Niño 1+2, 3, 3.4 e 4; índice ONI. É a variável-guia do estudo.",
    cadencia: "semanal + mensal",
  },
  {
    nome: "INMET — Meteorologia SP",
    descricao:
      "Séries de chuva e temperatura das estações automáticas que cobrem a capital e o interior.",
    cadencia: "horária / diária",
  },
  {
    nome: "ANA — Hidrologia",
    descricao:
      "Nível e vazão de rios e mananciais que abastecem a capital; base da análise de estiagens.",
    cadencia: "diária",
  },
  {
    nome: "CEMADEN — Desastres",
    descricao:
      "Rede de 710 estações e alertas de enchente e deslizamento; canal de decisão para serviços públicos.",
    cadencia: "quase tempo real",
  },
];