export interface Props {
  baseApi: string;
}

export interface ZonaConcentracao {
  zona: string;
  pctTotal: number | null;
  pctMaxDia: number | null;
  deltaPP: number | null;
  icInf: number | null;
  icSup: number | null;
  significativo: boolean;
}

export interface RespostaConcentracao {
  zonas?: ZonaConcentracao[];
}

export type EstadoConcentracao =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | { fase: "ok"; zonas: ZonaConcentracao[] };
