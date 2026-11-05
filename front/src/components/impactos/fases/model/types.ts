export interface Props {
  baseApi: string;
}

export interface FaseChuva {
  fase: string;
  meses: number;
  anomaliaPct: number | null;
}

export interface ZonaFases {
  zona: string;
  fases: FaseChuva[];
}

export interface RespostaFases {
  de?: number | null;
  ate?: number | null;
  zonas?: ZonaFases[];
}

export type EstadoFases =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | { fase: "ok"; de: number | null; ate: number | null; zonas: ZonaFases[] };
