export interface Props {
  baseApi: string;
}

export interface MesCenario {
  mes: string;
  rotulo: string;
  nino34Projetado: number | null;
}

export interface ZonaCenario {
  zona: string;
  mes: string;
  mesNum: number;
  ano: number;
  nino34Projetado: number | null;
  chuvaNormalMm: number | null;
  chuvaEsperadaMm: number | null;
  desvioMm: number | null;
  desvioPct: number | null;
  maiorDiaNormalMm: number | null;
  maiorDiaEsperadoMm: number | null;
}

export interface RespostaCenario {
  meses?: MesCenario[];
  zonas?: ZonaCenario[];
}

export type EstadoCenario =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | { fase: "ok"; meses: MesCenario[]; zonas: ZonaCenario[] };
