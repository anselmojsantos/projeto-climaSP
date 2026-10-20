export interface Props {
  baseApi: string;
}

export interface AnalogoAno {
  ano: number | null;
  valores: (number | null)[];
  rmse: number | null;
  correlacao: number | null;
  amplitude: number | null;
  trimDivergente: number | null;
}

export interface Candidatos {
  total: number;
  de: number | null;
  ate: number | null;
}

export interface RespostaAnalogos {
  temporadas?: string[];
  alvo?: (number | null)[];
  media?: (number | null)[];
  candidatos?: Candidatos;
  analogos?: AnalogoAno[];
}

export type EstadoAnalogos =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | {
      fase: "ok";
      temporadas: string[];
      alvo: (number | null)[];
      media: (number | null)[];
      candidatos: Candidatos | null;
      analogos: AnalogoAno[];
    };
