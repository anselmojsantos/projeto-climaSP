export interface Props {
  baseApi: string;
}

export interface MesProjecao {
  mes: string;
  rotulo: string;
  nino34: number;
}

export interface ZonaProjecao {
  zona: string;
  mes: string;
  mesNum: number;
  ano: number;
  nino34: number;
  chuvaNormalMm: number | null;
  chuvaEsperadaMm: number | null;
  desvioMm: number | null;
  desvioPct: number | null;
  maiorDiaNormalMm: number | null;
  maiorDiaEsperadoMm: number | null;
}

export interface RespostaProjecao {
  meses?: MesProjecao[];
  zonas?: ZonaProjecao[];
}

export type EstadoProjecao =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | { fase: "ok"; meses: MesProjecao[]; zonas: ZonaProjecao[] };
