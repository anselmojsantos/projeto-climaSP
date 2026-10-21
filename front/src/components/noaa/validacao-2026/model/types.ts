import type { RetaAjustada } from "../lib/regressao";

export interface Props {
  baseApi: string;
}

export interface AnalogoValidacao {
  ano: number | null;
  valores: (number | null)[];
  futuro: (number | null)[];
}

export interface RespostaValidacao {
  temporadas?: string[];
  temporadasFuturo?: string[];
  alvoFuturo?: (number | null)[];
  aso2026?: number | null;
  analogos?: AnalogoValidacao[];
}

export interface PontoValidacao {
  ano: number;
  aso: number;
  valor: number;
  indice: number;
}

export interface SerieValidacao {
  temporada: string;
  pontos: PontoValidacao[];
  reta: RetaAjustada;
  alvo2026: number | null;
}

export type EstadoValidacao =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | {
      fase: "ok";
      temporadas: string[];
      temporadasFuturo: string[];
      alvoFuturo: (number | null)[];
      aso2026: number | null;
      analogos: AnalogoValidacao[];
    };
