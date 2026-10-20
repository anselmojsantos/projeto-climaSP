export interface Props {
  baseApi: string;
}

export interface TemporadaRoni {
  temporada: string;
  roni: number | null;
  fase: string | null;
  origem: string | null;
}

export interface RespostaTemporadas {
  ano?: number | null;
  temporadas?: TemporadaRoni[];
}

export interface PontoRoni {
  temporada: string;
  roni: number;
  fase: string | null;
  origem: string | null;
}

export type EstadoRoni =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | { fase: "ok"; ano: number | null; temporadas: TemporadaRoni[] };
