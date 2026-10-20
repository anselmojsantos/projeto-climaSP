import type { ValorNumerico } from "../../lib/formato";

export interface Props {
  baseApi: string;
}

export interface LeituraDf2026 {
  evento: string | null;
  temporada: string;
  ano: ValorNumerico;
  origem: string | null;
  nino34_mm3: ValorNumerico;
}

export interface RespostaSinal {
  oni: LeituraDf2026;
  projecao: LeituraDf2026;
  weekly: { observation_date: string | null; nino34: ValorNumerico };
  coverage: {
    first_observation_date: string | null;
    last_observation_date: string | null;
    total_weeks: ValorNumerico;
  };
  frequencia: { regiao: string; percentual: ValorNumerico };
}

export type Estado =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | { fase: "ok"; dados: RespostaSinal };

export interface Visao {
  evento: string;
  subtitulo: string;
  temporadaRotulo: string;
  oniValor: string;
  nino34Data: string;
  nino34Valor: string;
  projecaoRotulo: string;
  projecaoData: string;
  projecaoValor: string;
  procedencia: string;
  cobertura: string;
  status: string;
}
