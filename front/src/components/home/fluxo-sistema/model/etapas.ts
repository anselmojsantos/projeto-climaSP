import type { Etapa } from "./types";

export const ETAPAS: Etapa[] = [
  {
    numero: "1",
    titulo: "Coleta e análise de dados",
    descricao: "Análise dos dados coletados nas fontes NOAA, CEMADEN e Defesa Civil/SP.",
  },
  {
    numero: "2",
    titulo: "PostgreSQL (Render)",
    descricao: "Dados brutos normalizados e versionados.",
  },
  {
    numero: "3",
    titulo: "ETL / ELT",
    descricao: "Limpeza, agregação e anomalias vs a média.",
  },
  {
    numero: "4",
    titulo: "Correlação e regressão linear",
    descricao:
      "Correlação e regressão linear entre o Pacífico (ONI) e o clima de SP, com análise de ciclos trimestrais móveis.",
  },
  {
    numero: "5",
    titulo: "Resultados e visualização",
    descricao:
      "Painéis, gráficos e tabelas para interpretar e visualizar os resultados da análise.",
  },
];
