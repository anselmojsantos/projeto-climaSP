export interface Props {
  baseApi: string;
}

export interface PontoSerie {
  mes: string;
  rotulo: string;
  chuva: number | null;
  nino: number | null;
}

export interface PeriodoElNino {
  inicio: string;
  fim: string;
  rotulo: string;
  pico: number;
}

export interface RespostaSerie {
  de?: string | null;
  ate?: string | null;
  pontos?: PontoSerie[];
  periodos?: PeriodoElNino[];
}

export interface Mes2026 {
  zona: string;
  mes: string;
  mesNum: number;
  chuvaMm: number | null;
  climaMm: number | null;
  anomaliaPct: number | null;
  maxDiaMm: number | null;
  climaMaxDiaMm: number | null;
  diasGe25: number | null;
  nino34: number | null;
}

export interface RespostaCaso2026 {
  ano?: number;
  zonas?: Mes2026[];
}

export type EstadoHistorico =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | {
      fase: "ok";
      de: string | null;
      ate: string | null;
      pontos: PontoSerie[];
      periodos: PeriodoElNino[];
      setembro: Mes2026[];
      ano: number;
    };
