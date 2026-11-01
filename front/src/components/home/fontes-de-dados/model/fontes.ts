import type { Fonte } from "./types";

export const FONTES: Fonte[] = [
  {
    nome: "NOAA / CPC — Oceano Pacífico",
    descricao:
      "SST e índices das regiões Niño 1+2, 3, 3.4 e 4; índice ONI. É a variável-guia do estudo.",
    cadencia: "semanal + mensal",
  },
  {
    nome: "CEMADEN — Desastres",
    descricao:
      "Rede de estações e alertas de enchente e deslizamento; canal de decisão para serviços públicos.",
    cadencia: "diária",
  },
  {
    nome: "Defesa Civil/SP — Ocorrências",
    descricao:
      "Registro de ocorrências de alagamentos e inundações no estado de São Paulo.",
    cadencia: "diária",
  },
];
